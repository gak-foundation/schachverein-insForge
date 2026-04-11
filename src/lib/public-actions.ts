"use server";

import { db } from "@/lib/db";
import { members, teams, seasons, tournaments, events, matches } from "@/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

// ─── Public Actions (No auth required) ─────────────────────────

export async function getPublicEvents(limit?: number) {
  const query = db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      eventType: events.eventType,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
      isAllDay: events.isAllDay,
    })
    .from(events)
    .where(sql`${events.startDate} >= NOW()`)
    .orderBy(events.startDate);

  if (limit) {
    return query.limit(limit);
  }
  return query;
}

export async function getPublicTeams() {
  const currentYear = new Date().getFullYear();

  const result = await db
    .select({
      id: teams.id,
      name: teams.name,
      league: teams.league,
      captainName: sql<string>`${members.firstName} || ' ' || ${members.lastName}`.as("captainName"),
      seasonName: seasons.name,
    })
    .from(teams)
    .innerJoin(seasons, eq(teams.seasonId, seasons.id))
    .leftJoin(members, eq(teams.captainId, members.id))
    .where(sql`${seasons.year} = ${currentYear}`)
    .orderBy(teams.name);

  return result;
}

export async function getPublicTournaments() {
  return db
    .select({
      id: tournaments.id,
      name: tournaments.name,
      type: tournaments.type,
      startDate: tournaments.startDate,
      endDate: tournaments.endDate,
      location: tournaments.location,
      isCompleted: tournaments.isCompleted,
    })
    .from(tournaments)
    .orderBy(desc(tournaments.startDate))
    .limit(10);
}

export async function getClubStats() {
  const [activeMembers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(members)
    .where(eq(members.status, "active"));

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teams);

  const currentYear = new Date().getFullYear();
  const [matchesThisYear] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(matches)
    .innerJoin(seasons, eq(matches.seasonId, seasons.id))
    .where(sql`${seasons.year} = ${currentYear}`);

  return {
    memberCount: activeMembers?.count ?? 0,
    teamCount: teamCount?.count ?? 0,
    matchesThisYear: matchesThisYear?.count ?? 0,
  };
}

export async function getUpcomingMatches(limit = 5) {
  const result = await db
    .select({
      id: matches.id,
      matchDate: matches.matchDate,
      location: matches.location,
      homeTeamId: matches.homeTeamId,
      awayTeamId: matches.awayTeamId,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      status: matches.status,
    })
    .from(matches)
    .where(
      and(
        sql`${matches.matchDate} >= CURRENT_DATE`,
        sql`${matches.status} != 'cancelled'`
      )
    )
    .orderBy(matches.matchDate)
    .limit(limit);

  // Get team names separately to avoid complex join
  const teamIds = [...new Set([...result.map(m => m.homeTeamId), ...result.map(m => m.awayTeamId)])];
  const teamData = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(sql`${teams.id} IN ${teamIds}`);

  const teamMap = new Map(teamData.map(t => [t.id, t.name]));

  return result.map(match => ({
    ...match,
    homeTeamName: teamMap.get(match.homeTeamId) || "Unbekannt",
    awayTeamName: teamMap.get(match.awayTeamId) || "Unbekannt",
  }));
}
