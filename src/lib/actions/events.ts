"use server";

import { db } from "@/lib/db";
import { events, seasons, matches, teams, tournaments } from "@/lib/db/schema";
import { eq, desc, and, gte, lte, or, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";
import { RRule, rrulestr } from "rrule";

export async function getEvents(limit?: number) {
  const clubId = await requireClubId();

  let query = db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
      isAllDay: events.isAllDay,
      recurrenceRule: events.recurrenceRule,
    })
    .from(events)
    .where(eq(events.clubId, clubId))
    .orderBy(desc(events.startDate));

  if (limit) {
    query = query.limit(limit) as typeof query;
  }

  return query;
}

export async function getEventById(id: string) {
  const clubId = await requireClubId();

  if (id.startsWith("tournament-")) {
    const realId = id.replace("tournament-", "");
    const [tournament] = await db
      .select({
        id: tournaments.id,
        title: tournaments.name,
        description: tournaments.description,
        eventType: tournaments.type,
        startDate: tournaments.startDate,
        endDate: tournaments.endDate,
        location: tournaments.location,
        isAllDay: sql`true`.as("is_all_day"),
        recurrenceRule: sql`null`.as<string | null>("recurrence_rule"),
        createdBy: sql`null`.as<string | null>("created_by"),
        createdAt: tournaments.createdAt,
        clubId: tournaments.clubId,
      })
      .from(tournaments)
      .where(and(eq(tournaments.id, realId), eq(tournaments.clubId, clubId)));
    return tournament ? { ...tournament, id } : undefined;
  }

  if (id.startsWith("match-")) {
    const realId = id.replace("match-", "");
    const [match] = await db
      .select({
        id: matches.id,
        title: sql<string>`${teams.name} || ' vs ' || ${teams.name}`.as("title"),
        description: sql<string>`'Mannschaftskampf'`.as("description"),
        eventType: sql<string>`'match'`.as("event_type"),
        startDate: sql<Date>`${matches.matchDate}::timestamp`.as("start_date"),
        endDate: sql<Date>`${matches.matchDate}::timestamp`.as("end_date"),
        location: matches.location,
        isAllDay: sql`true`.as("is_all_day"),
        recurrenceRule: sql`null`.as<string | null>("recurrence_rule"),
        createdBy: sql`null`.as<string | null>("created_by"),
        createdAt: matches.createdAt,
        clubId: sql<string>`${matches.seasonId}`.as("club_id"),
      })
      .from(matches)
      .where(eq(matches.id, realId));
    return match ? { ...match, id } : undefined;
  }

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.clubId, clubId)));
  return event;
}

export interface CalendarItem {
  id: string;
  originalId?: string;
  title: string;
  type: string;
  start: Date;
  end: Date;
  location?: string | null;
  isAllDay: boolean;
  isRecurring: boolean;
}

export async function getCalendarEvents(start: Date, end: Date): Promise<CalendarItem[]> {
  const clubId = await requireClubId();

  // 1. Fetch regular events
  const baseEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.clubId, clubId),
        or(
          and(gte(events.startDate, start), lte(events.startDate, end)),
          isNotNull(events.recurrenceRule)
        )
      )
    );

  const unifiedEvents: CalendarItem[] = [];

  // Expand recurring events
  baseEvents.forEach((event) => {
    if (event.recurrenceRule) {
      try {
        const rule = rrulestr(event.recurrenceRule);
        const occurrences = rule.between(start, end, true);
        
        occurrences.forEach((occ) => {
          const duration = event.endDate 
            ? event.endDate.getTime() - event.startDate.getTime()
            : 0;
            
          unifiedEvents.push({
            id: `${event.id}-${occ.getTime()}`,
            originalId: event.id,
            title: event.title,
            type: event.eventType,
            start: occ,
            end: new Date(occ.getTime() + duration),
            location: event.location,
            isAllDay: !!event.isAllDay,
            isRecurring: true,
          });
        });
      } catch (e) {
        console.error("Error parsing recurrence rule", e);
      }
    } else {
      unifiedEvents.push({
        id: event.id,
        title: event.title,
        type: event.eventType,
        start: event.startDate,
        end: event.endDate || event.startDate,
        location: event.location,
        isAllDay: !!event.isAllDay,
        isRecurring: false,
      });
    }
  });

  // 2. Fetch matches
  const clubMatches = await db.query.matches.findMany({
    where: (table, { and, gte, lte }) => and(
      gte(table.matchDate, start.toISOString().split('T')[0]),
      lte(table.matchDate, end.toISOString().split('T')[0])
    ),
    with: {
      homeTeam: true,
      awayTeam: true,
    }
  });

  clubMatches.forEach(match => {
    if (match.matchDate) {
      unifiedEvents.push({
        id: `match-${match.id}`,
        title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        type: "match",
        start: new Date(match.matchDate),
        end: new Date(match.matchDate),
        location: match.location,
        isAllDay: true,
        isRecurring: false,
      });
    }
  });

  // 3. Fetch tournaments
  const clubTournaments = await db
    .select()
    .from(tournaments)
    .where(
      and(
        eq(tournaments.clubId, clubId),
        or(
          and(gte(tournaments.startDate, start.toISOString().split('T')[0]), lte(tournaments.startDate, end.toISOString().split('T')[0])),
          and(gte(tournaments.endDate, start.toISOString().split('T')[0]), lte(tournaments.endDate, end.toISOString().split('T')[0]))
        )
      )
    );

  clubTournaments.forEach(tournament => {
    unifiedEvents.push({
      id: `tournament-${tournament.id}`,
      title: tournament.name,
      type: "tournament",
      start: new Date(tournament.startDate),
      end: tournament.endDate ? new Date(tournament.endDate) : new Date(tournament.startDate),
      location: tournament.location,
      isAllDay: true,
      isRecurring: false,
    });
  });

  return unifiedEvents;
}

export async function createEvent(formData: FormData) {
  const clubId = await requireClubId();

  const title = formData.get("title") as string;
  const eventType = formData.get("eventType") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const isAllDay = formData.get("isAllDay") === "on" || formData.get("isAllDay") === "true";
  const recurrenceRule = (formData.get("recurrenceRule") as string) || null;

  await db.insert(events).values({
    clubId,
    title,
    eventType,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    location,
    isAllDay,
    recurrenceRule,
  });

  revalidatePath("/dashboard/calendar");
}

export async function updateEvent(id: string, formData: FormData) {
  const clubId = await requireClubId();

  const title = formData.get("title") as string;
  const eventType = formData.get("eventType") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const isAllDay = formData.get("isAllDay") === "on" || formData.get("isAllDay") === "true";
  const recurrenceRule = (formData.get("recurrenceRule") as string) || null;

  await db.update(events)
    .set({
      title,
      eventType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      location,
      isAllDay,
      recurrenceRule,
    })
    .where(and(eq(events.id, id), eq(events.clubId, clubId)));

  revalidatePath("/dashboard/calendar");
}

export async function deleteEvent(id: string) {
  const clubId = await requireClubId();

  await db.delete(events)
    .where(and(eq(events.id, id), eq(events.clubId, clubId)));

  revalidatePath("/dashboard/calendar");
}

export async function getSeasons() {
  const clubId = await requireClubId();

  return db
    .select()
    .from(seasons)
    .where(eq(seasons.clubId, clubId))
    .orderBy(desc(seasons.year));
}

export async function createSeason(formData: FormData) {
  const clubId = await requireClubId();

  const name = formData.get("name") as string;
  const year = Number(formData.get("year"));
  const type = (formData.get("type") as string) || "club_internal";
  const startDate = (formData.get("startDate") as string) || null;
  const endDate = (formData.get("endDate") as string) || null;

  await db.insert(seasons).values({
    clubId,
    name,
    year,
    type: type as typeof seasons.$inferInsert.type,
    startDate,
    endDate,
  });

  revalidatePath("/dashboard/seasons");
}
