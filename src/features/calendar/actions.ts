"use server";

import { createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClubId } from "@/lib/actions/utils";
import { rrulestr } from "rrule";
import { CalendarItem } from "@/types";

export async function getEvents(limit?: number) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  let query = client
    .from("events")
    .select(
      "id, title, event_type, start_date, end_date, location, is_all_day, recurrence_rule"
    )
    .eq("club_id", clubId)
    .order("start_date", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error in getEvents:", error);
    return [];
  }

  return data || [];
}

export async function getEventById(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  if (id.startsWith("tournament-")) {
    const realId = id.replace("tournament-", "");
    const { data: tournament, error } = await client
      .from("tournaments")
      .select("*")
      .eq("id", realId)
      .eq("club_id", clubId)
      .single();

    if (error || !tournament) return undefined;

    return {
      ...tournament,
      id,
      title: tournament.name,
      eventType: tournament.type,
      startDate: tournament.start_date,
      endDate: tournament.end_date,
      isAllDay: true,
      recurrenceRule: null,
      createdBy: null,
      createdAt: tournament.created_at,
      clubId: tournament.club_id,
    };
  }

  if (id.startsWith("match-")) {
    const realId = id.replace("match-", "");
    const { data: match, error } = await client
      .from("matches")
      .select("*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)")
      .eq("id", realId)
      .single();

    if (error || !match) return undefined;

    return {
      ...match,
      id,
      title: `${match.home_team?.name || ""} vs ${match.away_team?.name || ""}`,
      description: "Mannschaftskampf",
      eventType: "match",
      startDate: match.match_date,
      endDate: match.match_date,
      location: match.location,
      isAllDay: true,
      recurrenceRule: null,
      createdBy: null,
      createdAt: match.created_at,
      clubId: match.season_id,
    };
  }

  const { data: event, error } = await client
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("club_id", clubId)
    .single();

  if (error) {
    console.error("Error in getEventById:", error);
    return undefined;
  }

  return event;
}

export async function getCalendarEvents(
  start: Date,
  end: Date
): Promise<CalendarItem[]> {
  const clubId = await requireClubId();
  const client = createServiceClient();

  // 1. Fetch regular events
  const { data: baseEvents, error: eventsError } = await client
    .from("events")
    .select("*")
    .eq("club_id", clubId)
    .or(
      `and(start_date.gte.${start.toISOString()},start_date.lte.${end.toISOString()}),recurrence_rule.not.is.null`
    );

  if (eventsError) {
    console.error("Error fetching events:", eventsError);
  }

  const unifiedEvents: CalendarItem[] = [];

  // Expand recurring events
  (baseEvents || []).forEach((event: any) => {
    if (event.recurrence_rule) {
      try {
        const rule = rrulestr(event.recurrence_rule);
        const occurrences = rule.between(start, end, true);

        occurrences.forEach((occ) => {
          const duration = event.end_date
            ? new Date(event.end_date).getTime() -
              new Date(event.start_date).getTime()
            : 0;

          unifiedEvents.push({
            id: `${event.id}-${occ.getTime()}`,
            originalId: event.id,
            title: event.title,
            type: event.event_type,
            start: occ,
            end: new Date(occ.getTime() + duration),
            location: event.location,
            isAllDay: !!event.is_all_day,
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
        type: event.event_type,
        start: new Date(event.start_date),
        end: event.end_date
          ? new Date(event.end_date)
          : new Date(event.start_date),
        location: event.location,
        isAllDay: !!event.is_all_day,
        isRecurring: false,
      });
    }
  });

  // 2. Fetch matches
  const { data: clubMatches, error: matchesError } = await client
    .from("matches")
    .select("*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)")
    .gte("match_date", start.toISOString().split("T")[0])
    .lte("match_date", end.toISOString().split("T")[0]);

  if (matchesError) {
    console.error("Error fetching matches:", matchesError);
  }

  (clubMatches || []).forEach((match: any) => {
    if (match.match_date) {
      unifiedEvents.push({
        id: `match-${match.id}`,
        title: `${match.home_team?.name || ""} vs ${match.away_team?.name || ""}`,
        type: "match",
        start: new Date(match.match_date),
        end: new Date(match.match_date),
        location: match.location,
        isAllDay: true,
        isRecurring: false,
      });
    }
  });

  // 3. Fetch tournaments
  const { data: clubTournaments, error: tournamentsError } = await client
    .from("tournaments")
    .select("*")
    .eq("club_id", clubId)
    .or(
      `and(start_date.gte.${start.toISOString().split("T")[0]},start_date.lte.${end.toISOString().split("T")[0]}),and(end_date.gte.${start.toISOString().split("T")[0]},end_date.lte.${end.toISOString().split("T")[0]})`
    );

  if (tournamentsError) {
    console.error("Error fetching tournaments:", tournamentsError);
  }

  (clubTournaments || []).forEach((tournament: any) => {
    unifiedEvents.push({
      id: `tournament-${tournament.id}`,
      title: tournament.name,
      type: "tournament",
      start: new Date(tournament.start_date),
      end: tournament.end_date
        ? new Date(tournament.end_date)
        : new Date(tournament.start_date),
      location: tournament.location,
      isAllDay: true,
      isRecurring: false,
    });
  });

  return unifiedEvents;
}

export async function createEvent(
  formData: FormData,
  explicitClubId?: string
) {
  const clubId = explicitClubId || (await requireClubId());
  const client = createServiceClient();

  const title = formData.get("title") as string;
  const eventType = formData.get("eventType") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const isAllDay =
    formData.get("isAllDay") === "on" || formData.get("isAllDay") === "true";
  const recurrenceRule = (formData.get("recurrenceRule") as string) || null;

  const { error } = await client.from("events").insert({
    club_id: clubId,
    title,
    event_type: eventType,
    start_date: startDate,
    end_date: endDate,
    location,
    is_all_day: isAllDay,
    recurrence_rule: recurrenceRule,
  });

  if (error) {
    console.error("Error creating event:", error);
    throw new Error("Fehler beim Erstellen des Events");
  }

  revalidatePath("/dashboard/calendar");
}

export async function updateEvent(id: string, formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const title = formData.get("title") as string;
  const eventType = formData.get("eventType") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const isAllDay =
    formData.get("isAllDay") === "on" || formData.get("isAllDay") === "true";
  const recurrenceRule = (formData.get("recurrenceRule") as string) || null;

  const { error } = await client
    .from("events")
    .update({
      title,
      event_type: eventType,
      start_date: startDate,
      end_date: endDate,
      location,
      is_all_day: isAllDay,
      recurrence_rule: recurrenceRule,
    })
    .eq("id", id)
    .eq("club_id", clubId);

  if (error) {
    console.error("Error updating event:", error);
    throw new Error("Fehler beim Aktualisieren des Events");
  }

  revalidatePath("/dashboard/calendar");
}

export async function deleteEvent(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { error } = await client
    .from("events")
    .delete()
    .eq("id", id)
    .eq("club_id", clubId);

  if (error) {
    console.error("Error deleting event:", error);
    throw new Error("Fehler beim Löschen des Events");
  }

  revalidatePath("/dashboard/calendar");
}

export async function getSeasons() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from("seasons")
    .select("*")
    .eq("club_id", clubId)
    .order("year", { ascending: false });

  if (error) {
    console.error("Error in getSeasons:", error);
    return [];
  }

  return data || [];
}

export async function createSeason(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const name = formData.get("name") as string;
  const year = Number(formData.get("year"));
  const type = (formData.get("type") as string) || "club_internal";
  const startDate = (formData.get("startDate") as string) || null;
  const endDate = (formData.get("endDate") as string) || null;

  const { error } = await client.from("seasons").insert({
    club_id: clubId,
    name,
    year,
    type,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.error("Error creating season:", error);
    throw new Error("Fehler beim Erstellen der Saison");
  }

  revalidatePath("/dashboard/seasons");
  redirect("/dashboard/seasons");
}
