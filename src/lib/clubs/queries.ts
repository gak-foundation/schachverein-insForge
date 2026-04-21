import { eq, and, or, like, sql, SQL, isNull } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import {
  clubs,
  clubMemberships,
  clubInvitations,
  members,
  seasons,
  teams,
  tournaments,
  events,
  payments,
  documents,
  contributionRates,
  auditLog,
  authUsers,
} from "@/lib/db/schema";

// ─── Club Query Helpers ─────────────────────────────────────────

export async function getClubById(id: string) {
  const [club] = await db.select().from(clubs).where(eq(clubs.id, id));
  return club ?? null;
}

export async function getClubBySlug(slug: string) {
  const [club] = await db.select().from(clubs).where(eq(clubs.slug, slug));
  return club ?? null;
}

export async function getUserClubs(userId: string) {
  return db
    .select({
      id: clubs.id,
      name: clubs.name,
      slug: clubs.slug,
      logoUrl: clubs.logoUrl,
      plan: clubs.plan,
      isActive: clubs.isActive,
      membershipRole: clubMemberships.role,
      isPrimary: clubMemberships.isPrimary,
    })
    .from(clubMemberships)
    .innerJoin(clubs, eq(clubMemberships.clubId, clubs.id))
    .where(
      and(
        eq(clubMemberships.memberId, userId),
        eq(clubMemberships.status, "active")
      )
    )
    .orderBy(clubMemberships.isPrimary);
}

export async function getUserPrimaryClub(userId: string) {
  const [result] = await db
    .select({
      id: clubs.id,
      name: clubs.name,
      slug: clubs.slug,
      logoUrl: clubs.logoUrl,
      plan: clubs.plan,
      isActive: clubs.isActive,
    })
    .from(clubMemberships)
    .innerJoin(clubs, eq(clubMemberships.clubId, clubs.id))
    .where(
      and(
        eq(clubMemberships.memberId, userId),
        eq(clubMemberships.isPrimary, true),
        eq(clubMemberships.status, "active")
      )
    );
  return result ?? null;
}

// ─── Club Filtering Functions ──────────────────────────────────

export function withClubFilter<
  T extends { where: (condition: SQL | undefined) => T } & { clubId: AnyPgColumn },
>(query: T, clubId: string) {
  return query.where(eq(query.clubId, clubId));
}

export async function isMemberOfClub(memberId: string, clubId: string) {
  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.memberId, memberId),
        eq(clubMemberships.clubId, clubId),
        eq(clubMemberships.status, "active")
      )
    );
  return !!membership;
}

export async function getClubRole(memberId: string, clubId: string) {
  const [membership] = await db
    .select({ role: clubMemberships.role })
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.memberId, memberId),
        eq(clubMemberships.clubId, clubId)
      )
    );
  return membership?.role ?? null;
}

// ─── Club Data Access (with isolation) ──────────────────────────

export async function getMembersByClub(clubId: string, search?: string) {
  const conditions: SQL<unknown>[] = [eq(clubMemberships.clubId, clubId)];

  if (search) {
    conditions.push(
      or(
        like(members.firstName, `%${search}%`),
        like(members.lastName, `%${search}%`),
        like(members.email, `%${search}%`)
      )!
    );
  }

  return db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phone,
      status: members.status,
      role: clubMemberships.role,
      dwz: members.dwz,
      joinedAt: clubMemberships.joinedAt,
    })
    .from(clubMemberships)
    .innerJoin(members, eq(clubMemberships.memberId, members.id))
    .where(and(...conditions))
    .orderBy(members.lastName);
}

export async function getSeasonsByClub(clubId: string) {
  return db
    .select()
    .from(seasons)
    .where(eq(seasons.clubId, clubId))
    .orderBy(seasons.year);
}

export async function getTeamsByClub(clubId: string, seasonId?: string) {
  const conditions: SQL<unknown>[] = [eq(teams.clubId, clubId)];

  if (seasonId) {
    conditions.push(eq(teams.seasonId, seasonId));
  }

  return db
    .select({
      id: teams.id,
      name: teams.name,
      league: teams.league,
      seasonId: teams.seasonId,
      captainId: teams.captainId,
    })
    .from(teams)
    .where(and(...conditions))
    .orderBy(teams.name);
}

export async function getTournamentsByClub(clubId: string) {
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
    .where(eq(tournaments.clubId, clubId))
    .orderBy(tournaments.startDate);
}

export async function getEventsByClub(clubId: string, limit?: number) {
  let query = db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
      isAllDay: events.isAllDay,
    })
    .from(events)
    .where(eq(events.clubId, clubId))
    .orderBy(events.startDate);

  if (limit) {
    query = query.limit(limit) as typeof query;
  }

  return query;
}

export async function getPaymentsByClub(clubId: string) {
  return db
    .select({
      id: payments.id,
      memberId: payments.memberId,
      amount: payments.amount,
      description: payments.description,
      status: payments.status,
      dueDate: payments.dueDate,
      year: payments.year,
    })
    .from(payments)
    .where(eq(payments.clubId, clubId))
    .orderBy(payments.createdAt);
}

export async function getDocumentsByClub(clubId: string) {
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
    .orderBy(documents.createdAt);
}

export async function getContributionRatesByClub(clubId: string) {
  return db
    .select()
    .from(contributionRates)
    .where(eq(contributionRates.clubId, clubId))
    .orderBy(contributionRates.validFrom);
}

export async function getAuditLogsByClub(clubId: string, limit = 100) {
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
    .orderBy(auditLog.createdAt)
    .limit(limit);
}

// ─── Club Management ──────────────────────────────────────────

export async function createClub(data: {
  name: string;
  slug: string;
  contactEmail?: string;
  website?: string;
  address?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  };
}) {
  const [club] = await db
    .insert(clubs)
    .values({
      name: data.name,
      slug: data.slug,
      contactEmail: data.contactEmail,
      website: data.website,
      address: data.address,
    })
    .returning();

  return club;
}

export async function updateClub(
  clubId: string,
  data: Partial<{
    name: string;
    logoUrl: string;
    website: string;
    address: {
      street: string;
      zipCode: string;
      city: string;
      country: string;
    } | null;
    contactEmail: string;
    settings: Record<string, unknown>;
  }>
) {
  const [club] = await db
    .update(clubs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(clubs.id, clubId))
    .returning();

  return club;
}

export async function updateUserActiveClub(userId: string, clubId: string | null) {
  await db
    .update(authUsers)
    .set({
      activeClubId: clubId,
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, userId));
}

export async function addMemberToClub(
  clubId: string,
  memberId: string,
  role: string = "mitglied",
  isPrimary: boolean = false
) {
  const [membership] = await db
    .insert(clubMemberships)
    .values({
      clubId,
      memberId,
      role: role as typeof clubMemberships.$inferInsert.role,
      isPrimary,
      status: "active",
    })
    .onConflictDoUpdate({
      target: [clubMemberships.clubId, clubMemberships.memberId],
      set: {
        role: role as typeof clubMemberships.$inferInsert.role,
        status: "active",
        updatedAt: new Date(),
      },
    })
    .returning();

  return membership;
}

// ─── Invitations ───────────────────────────────────────────────

export async function createClubInvitation(data: {
  clubId: string;
  email: string;
  role?: string;
  invitedBy: string;
  expiresAt: Date;
}) {
  const token = crypto.randomUUID();

  const [invitation] = await db
    .insert(clubInvitations)
    .values({
      clubId: data.clubId,
      email: data.email,
      role: (data.role as typeof clubMemberships.$inferInsert.role | undefined) ?? "mitglied",
      invitedBy: data.invitedBy,
      token,
      expiresAt: data.expiresAt,
    })
    .returning();

  return invitation;
}

export async function getInvitationByToken(token: string) {
  const [invitation] = await db
    .select({
      id: clubInvitations.id,
      clubId: clubInvitations.clubId,
      email: clubInvitations.email,
      role: clubInvitations.role,
      expiresAt: clubInvitations.expiresAt,
      usedAt: clubInvitations.usedAt,
      club: {
        id: clubs.id,
        name: clubs.name,
      },
    })
    .from(clubInvitations)
    .innerJoin(clubs, eq(clubInvitations.clubId, clubs.id))
    .where(
      and(
        eq(clubInvitations.token, token),
        sql`${clubInvitations.expiresAt} > NOW()`,
        isNull(clubInvitations.usedAt)
      )
    );

  return invitation ?? null;
}

export async function markInvitationUsed(invitationId: string) {
  await db
    .update(clubInvitations)
    .set({ usedAt: new Date() })
    .where(eq(clubInvitations.id, invitationId));
}

// ─── Slug Generation ────────────────────────────────────────────

export function generateClubSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.slug, slug));
  return !existing;
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = generateClubSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (!(await isSlugAvailable(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ─── Feature Gates ─────────────────────────────────────────────

const PLAN_FEATURES = {
  free: {
    maxMembers: 30,
    tournaments: true,
    teams: true,
    payments: true,
    documents: true,
    apiAccess: false,
    customDomain: false,
    prioritySupport: false,
  },
  pro: {
    maxMembers: Infinity,
    tournaments: true,
    teams: true,
    payments: true,
    documents: true,
    apiAccess: true,
    customDomain: false,
    prioritySupport: false,
  },
  enterprise: {
    maxMembers: Infinity,
    tournaments: true,
    teams: true,
    payments: true,
    documents: true,
    apiAccess: true,
    customDomain: true,
    prioritySupport: true,
  },
};

export function getPlanFeatures(plan: "free" | "pro" | "enterprise") {
  return PLAN_FEATURES[plan] ?? PLAN_FEATURES.free;
}

export async function hasFeature(clubId: string, feature: keyof typeof PLAN_FEATURES["free"]) {
  const [club] = await db
    .select({ plan: clubs.plan })
    .from(clubs)
    .where(eq(clubs.id, clubId));

  if (!club) return false;

  const features = getPlanFeatures(club.plan);
  return features[feature] ?? false;
}

export async function getClubMemberCount(clubId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.clubId, clubId),
        eq(clubMemberships.status, "active")
      )
    );
  return result[0]?.count ?? 0;
}

export async function canAddMember(clubId: string): Promise<{ allowed: boolean; reason?: string }> {
  const [club] = await db
    .select({ plan: clubs.plan })
    .from(clubs)
    .where(eq(clubs.id, clubId));

  if (!club) {
    return { allowed: false, reason: "Verein nicht gefunden" };
  }

  const features = getPlanFeatures(club.plan);
  const currentCount = await getClubMemberCount(clubId);

  if (currentCount >= features.maxMembers) {
    return {
      allowed: false,
      reason: `Maximale Mitgliederzahl (${features.maxMembers}) für ${club.plan} Plan erreicht`,
    };
  }

  return { allowed: true };
}
