import { eq, and, or, like, sql, SQL, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { createServiceClient } from "@/lib/insforge";
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
  try {
    const client = createServiceClient();
    const { data, error } = await client.database
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single();

    if (data && !error) {
      return data;
    }
  } catch (error) {
    // Silent fail, try Drizzle
  }

  const [club] = await db.select().from(clubs).where(eq(clubs.id, id));
  return club ?? null;
}

export async function getClubBySlug(slug: string) {
  try {
    // 1. Try InsForge REST API (Service Role) - avoids RLS/Pooler issues
    const client = createServiceClient();
    const { data, error } = await client.database
      .from('clubs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data && !error) {
      return data;
    }
  } catch (error) {
    // Silent fail, try Drizzle
  }

  // 2. Fallback to Drizzle
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
  try {
    // 1. Try Drizzle
    return await db
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
  } catch (error) {
    // 2. Fallback to REST API (Service Role)
    const client = createServiceClient();
    
    // First get the user's club info from auth_user
    const { data: userData, error: userError } = await client
      .from('auth_user')
      .select('club_id, member_id')
      .eq('id', userId)
      .single();
    
    if (userError || !userData?.club_id) return [];

    // Then get the club and membership details
    const [{ data: clubData }, { data: memberData }] = await Promise.all([
      client.from('clubs').select('*').eq('id', userData.club_id).single(),
      client.from('members').select('role').eq('id', userData.member_id).single()
    ]);

    if (!clubData) return [];

    return [{
      id: clubData.id,
      name: clubData.name,
      slug: clubData.slug,
      logoUrl: clubData.logo_url,
      plan: clubData.plan,
      isActive: clubData.is_active,
      membershipRole: memberData?.role || 'mitglied',
      isPrimary: true,
    }];
  }
}

export async function getUserPrimaryClub(userId: string) {
  try {
    // 1. Try Drizzle
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
  } catch (error) {
    // 2. Fallback to REST API (Service Role)
    const client = createServiceClient();
    
    const { data: userData, error: userError } = await client
      .from('auth_user')
      .select('club_id')
      .eq('id', userId)
      .single();
    
    if (userError || !userData?.club_id) return null;

    const { data: clubData, error: clubError } = await client
      .from('clubs')
      .select('*')
      .eq('id', userData.club_id)
      .single();

    if (clubError || !clubData) return null;

    return {
      id: clubData.id,
      name: clubData.name,
      slug: clubData.slug,
      logoUrl: clubData.logo_url,
      plan: clubData.plan,
      isActive: clubData.is_active,
    };
  }
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
  try {
    // 1. Try InsForge REST API (Service Role) - avoids RLS/Pooler issues
    const client = createServiceClient();
    const { data: club, error } = await client
      .from('clubs')
      .insert({
        name: data.name,
        slug: data.slug,
        contact_email: data.contactEmail,
        website: data.website,
        address: data.address,
      })
      .select()
      .single();

    if (club && !error) {
      return club;
    }
  } catch (error) {
    // Silent fail, try Drizzle
  }

  // 2. Fallback to Drizzle
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
  try {
    // 1. Try InsForge REST API (Service Role)
    const client = createServiceClient();
    
    // Convert camelCase keys to snake_case for InsForge REST
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.contactEmail !== undefined) updateData.contact_email = data.contactEmail;
    if (data.settings !== undefined) updateData.settings = data.settings;

    const { data: club, error } = await client
      .from('clubs')
      .update(updateData)
      .eq('id', clubId)
      .select()
      .single();

    if (club && !error) {
      return club;
    }
  } catch (error) {
    // Silent fail
  }

  // 2. Fallback to Drizzle
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
  try {
    // 1. Try InsForge REST API (Service Role) - avoids RLS/Pooler issues
    const client = createServiceClient();
    const { error } = await client
      .from('auth_user')
      .update({
        club_id: clubId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (!error) return;
  } catch (error) {
    // Silent fail, try Drizzle
  }

  // 2. Fallback to Drizzle
  await db
    .update(authUsers)
    .set({
      clubId: clubId,
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, userId));
}

export async function createMember(data: {
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
  role?: string;
  clubId?: string;
}) {
  try {
    // 1. Try InsForge REST API (Service Role)
    const client = createServiceClient();
    const { data: member, error } = await client
      .from('members')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        status: data.status || 'active',
        role: data.role || 'mitglied',
        club_id: data.clubId,
      })
      .select()
      .single();

    if (member && !error) {
      return {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        status: member.status,
        role: member.role,
        clubId: member.club_id,
      };
    }
  } catch (error) {
    // Silent fail
  }

  // 2. Fallback to Drizzle
  const [member] = await db
    .insert(members)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      status: data.status as any || "active",
      role: data.role as any || "mitglied",
      clubId: data.clubId,
    })
    .returning();

  return member;
}

export async function addMemberToClub(
  clubId: string,
  memberId: string,
  role: string = "mitglied",
  isPrimary: boolean = false
) {
  try {
    // 1. Try InsForge REST API (Service Role)
    const client = createServiceClient();
    
    // Update member's club
    await client
      .from('members')
      .update({ 
        club_id: clubId, 
        role: role, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', memberId);

    // Upsert membership
    const { data: membership, error } = await client
      .from('club_memberships')
      .upsert({
        club_id: clubId,
        member_id: memberId,
        role: role,
        is_primary: isPrimary,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'club_id,member_id'
      })
      .select()
      .single();

    if (membership && !error) {
      return membership;
    }
  } catch (error) {
    // Silent fail
  }

  // 2. Fallback to Drizzle
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
  try {
    // 1. Try InsForge REST API (Service Role) - avoids RLS/Pooler issues
    const client = createServiceClient();
    const { data, error } = await client
      .from('clubs')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!error) {
      return !data;
    }
  } catch (error) {
    // Silent fail, try Drizzle
  }

  // 2. Fallback to Drizzle
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
