"use server";

import { db } from "@/lib/db";
import { auditLog, documents, clubMemberships, tournaments, teams, events } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireClubId } from "./utils";

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

  const memberCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.clubId, clubId),
      eq(clubMemberships.status, "active")
    ));

  const tournamentCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tournaments)
    .where(eq(tournaments.clubId, clubId));

  const teamCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(teams)
    .where(eq(teams.clubId, clubId));

  const upcomingEvents = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(events)
    .where(and(
      eq(events.clubId, clubId),
      sql`${events.startDate} > NOW()`
    ));

  return {
    memberCount: memberCount[0]?.count ?? 0,
    teamCount: teamCount[0]?.count ?? 0,
    activeTournaments: tournamentCount[0]?.count ?? 0,
    pendingPayments: 0,
    avgDwz: null,
    gamesThisMonth: 0,
    upcomingMatches: [] as { id: string; matchDate: Date | null; homeTeamName: string; location: string | null }[],
    upcomingEvents: [] as { id: string; title: string; startDate: Date }[],
  };
}
