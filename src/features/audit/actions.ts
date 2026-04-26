"use server";

import { db } from "@/lib/db";
import { 
  auditLog, 
  documents, 
  clubMemberships, 
  tournaments, 
  teams, 
  events,
  payments,
  members,
  games,
  matches
} from "@/lib/db/schema";
import { eq, desc, and, sql, gte, lt, or } from "drizzle-orm";
import { requireClubId } from "@/lib/auth/session";

export async function getAuditLogs(limit = 100) {
  const clubId = await requireClubId();

  return db
    .select({
      id: auditLog.id,
      userId: auditLog.userId,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      changes: auditLog.changes,
      ipAddress: auditLog.ipAddress,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(eq(auditLog.clubId, clubId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

export async function getDocuments() {
  const clubId = await requireClubId();

  return db
    .select({
      id: documents.id,
      title: documents.title,
      fileName: documents.fileName,
      category: documents.category,
      mimeType: documents.mimeType,
      fileSize: documents.fileSize,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.clubId, clubId))
    .orderBy(desc(documents.createdAt));
}

export async function getDashboardStats() {
  const clubId = await requireClubId();
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [memberCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.clubId, clubId),
      eq(clubMemberships.status, "active")
    ));

  const [tournamentCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tournaments)
    .where(and(
      eq(tournaments.clubId, clubId),
      eq(tournaments.isCompleted, false)
    ));

  const [teamCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(teams)
    .where(eq(teams.clubId, clubId));

  const [pendingPayments] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(payments)
    .where(and(
      eq(payments.clubId, clubId),
      or(eq(payments.status, "pending"), eq(payments.status, "overdue"))
    ));

  const [avgDwz] = await db
    .select({ avg: sql<number>`AVG(${members.dwz})` })
    .from(members)
    .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
    .where(and(
      eq(clubMemberships.clubId, clubId),
      eq(clubMemberships.status, "active"),
      sql`${members.dwz} > 0`
    ));

  const [gamesThisMonth] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(games)
    .innerJoin(tournaments, eq(games.tournamentId, tournaments.id))
    .where(and(
      eq(tournaments.clubId, clubId),
      gte(games.playedAt, firstDayOfMonth),
      lt(games.playedAt, nextMonth)
    ));

  const upcomingMatches = await db
    .select({
      id: matches.id,
      matchDate: matches.matchDate,
      homeTeamName: teams.name,
      location: matches.location,
    })
    .from(matches)
    .innerJoin(teams, eq(matches.homeTeamId, teams.id))
    .where(and(
      eq(teams.clubId, clubId),
      gte(matches.matchDate, sql`CURRENT_DATE`),
      eq(matches.status, "scheduled")
    ))
    .orderBy(matches.matchDate)
    .limit(5);

  const upcomingEvents = await db
    .select({
      id: events.id,
      title: events.title,
      startDate: events.startDate,
    })
    .from(events)
    .where(and(
      eq(events.clubId, clubId),
      gte(events.startDate, now)
    ))
    .orderBy(events.startDate)
    .limit(5);

  return {
    memberCount: Number(memberCount?.count ?? 0),
    teamCount: Number(teamCount?.count ?? 0),
    activeTournaments: Number(tournamentCount?.count ?? 0),
    pendingPayments: Number(pendingPayments?.count ?? 0),
    avgDwz: avgDwz?.avg ? Math.round(avgDwz.avg) : null,
    gamesThisMonth: Number(gamesThisMonth?.count ?? 0),
    upcomingMatches: upcomingMatches.map(m => ({
      ...m,
      matchDate: m.matchDate ? new Date(m.matchDate) : null
    })),
    upcomingEvents: upcomingEvents.map(e => ({
      ...e,
      startDate: new Date(e.startDate)
    })),
  };
}
