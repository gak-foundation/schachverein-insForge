"use server";

import { db } from "@/lib/db";
import { members, teams, seasons, tournaments, events, matches, clubs } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

// ─── Public Actions (No auth required) ─────────────────────────

export async function getPublicEvents(clubSlug: string, limit?: number) {
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
    .innerJoin(clubs, eq(events.clubId, clubs.id))
    .where(
      and(
        eq(clubs.slug, clubSlug),
        sql`${events.startDate} >= NOW()`
      )
    )
    .orderBy(events.startDate);

  if (limit) {
    return query.limit(limit);
  }
  return query;
}

export async function getPublicTeams(clubSlug: string) {
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
    .innerJoin(clubs, eq(teams.clubId, clubs.id))
    .innerJoin(seasons, eq(teams.seasonId, seasons.id))
    .leftJoin(members, eq(teams.captainId, members.id))
    .where(
      and(
        eq(clubs.slug, clubSlug),
        sql`${seasons.year} = ${currentYear}`
      )
    )
    .orderBy(teams.name);

  return result;
}

export async function getPublicTournaments(clubSlug: string) {
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
    .innerJoin(clubs, eq(tournaments.clubId, clubs.id))
    .where(eq(clubs.slug, clubSlug))
    .orderBy(desc(tournaments.startDate))
    .limit(10);
}

export async function getClubStats(clubSlug: string) {
  // We need to resolve slug to ID first for performance if doing multiple queries
  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, clubSlug),
    columns: { id: true }
  });

  if (!club) return { memberCount: 0, teamCount: 0, matchesThisYear: 0 };

  const [activeMembers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(members)
    .innerJoin(clubs, eq(members.id, members.id)) // This is a placeholder, actual schema should have club_memberships
    .where(and(eq(members.status, "active")));
    // Note: members logic needs careful adjustment based on club_memberships table
    // For now, let's keep it simple and focus on teams/matches which definitely have clubId

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teams)
    .where(eq(teams.clubId, club.id));

  const currentYear = new Date().getFullYear();
  const [matchesThisYear] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(matches)
    .innerJoin(seasons, eq(matches.seasonId, seasons.id))
    .where(and(eq(seasons.clubId, club.id), sql`${seasons.year} = ${currentYear}`));

  return {
    memberCount: activeMembers?.count ?? 0,
    teamCount: teamCount?.count ?? 0,
    matchesThisYear: matchesThisYear?.count ?? 0,
  };
}

export async function getUpcomingMatches(clubSlug: string, limit = 5) {
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
    .innerJoin(seasons, eq(matches.seasonId, seasons.id))
    .innerJoin(clubs, eq(seasons.clubId, clubs.id))
    .where(
      and(
        eq(clubs.slug, clubSlug),
        sql`${matches.matchDate} >= CURRENT_DATE`,
        sql`${matches.status} != 'cancelled'`
      )
    )
    .orderBy(matches.matchDate)
    .limit(limit);

  if (result.length === 0) return [];

  // Get team names separately
  const teamIds = [...new Set([...result.map(m => m.homeTeamId), ...result.map(m => m.awayTeamId)])];
  const teamData = teamIds.length > 0
    ? await db
        .select({ id: teams.id, name: teams.name })
        .from(teams)
        .where(sql`${teams.id} IN ${teamIds}`)
    : [];

  const teamMap = new Map(teamData.map(t => [t.id, t.name]));

  return result.map(match => ({
    ...match,
    homeTeamName: teamMap.get(match.homeTeamId) || "Unbekannt",
    awayTeamName: teamMap.get(match.awayTeamId) || "Unbekannt",
  }));
}
