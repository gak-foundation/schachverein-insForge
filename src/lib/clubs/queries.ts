import { eq, and, or, like, sql, SQL, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clubs,
  clubMemberships,
  clubInvitations,
  members,
  events,
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

export async function getClubByStripeCustomerId(stripeCustomerId: string) {
  const [club] = await db
    .select()
    .from(clubs)
    .where(eq(clubs.stripeCustomerId, stripeCustomerId));
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
      membershipRole: members.role,
      isPrimary: sql`true`,
    })
    .from(authUsers)
    .innerJoin(clubs, eq(authUsers.clubId, clubs.id))
    .innerJoin(members, eq(authUsers.memberId, members.id))
    .where(eq(authUsers.id, userId));
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
    .from(authUsers)
    .innerJoin(clubs, eq(authUsers.clubId, clubs.id))
    .where(eq(authUsers.id, userId));
  return result ?? null;
}

// ─── Club Filtering Functions ──────────────────────────────────

export function withClubFilter<
  T extends { where: (condition: SQL | undefined) => T } & { clubId: any },
>(query: T, clubId: string) {
  return query.where(eq(query.clubId, clubId));
}

export async function isMemberOfClub(memberId: string, clubId: string) {
  const [member] = await db
    .select()
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.clubId, clubId)));
  return !!member;
}

export async function getClubRole(memberId: string, clubId: string) {
  const [member] = await db
    .select({ role: members.role })
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.clubId, clubId)));
  return member?.role ?? null;
}

// ─── Club Data Access ───────────────────────────────────────────

export async function getMembersByClub(clubId: string, search?: string) {
  const conditions: SQL<unknown>[] = [eq(members.clubId, clubId)];

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
      role: members.role,
      dwz: members.dwz,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .where(and(...conditions))
    .orderBy(members.lastName);
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

export async function updateUserClub(userId: string, clubId: string | null) {
  await db
    .update(authUsers)
    .set({
      clubId: clubId,
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
  await db
    .update(members)
    .set({ clubId, role: role as typeof members.$inferInsert.role, updatedAt: new Date() })
    .where(eq(members.id, memberId));

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

// Re-export feature checks
export { hasFeature } from "@/lib/billing/features";

export async function getClubMemberCount(clubId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(members)
    .where(eq(members.clubId, clubId));
  return result[0]?.count ?? 0;
}
