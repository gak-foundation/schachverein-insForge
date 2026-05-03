"use server";

import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clubs,
  clubMemberships,
  clubInvitations,
  members,
  authUsers,
} from "@/lib/db/schema";
import { getAllAuthUsers, updateAuthUser } from "@/lib/db/queries/auth";
import { requireAuth, requireClub } from "@/lib/auth/session";
import { sendClubInvitationEmail } from "@/lib/auth/email";
import { createServerClient, createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import {
  createClub,
  generateUniqueSlug,
  addMemberToClub,
  createMember,
  createClubInvitation,
  getInvitationByToken,
  markInvitationUsed,
  updateUserClub,
  getClubById,
} from "./queries";
import { getInvitationUrl } from "@/lib/auth/invitations";

// ─── Club CRUD ─────────────────────────────────────────────────

export async function createClubAction(formData: FormData) {
  const session = await requireAuth();

  const name = formData.get("name") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const website = formData.get("website") as string;
  const street = formData.get("street") as string;
  const zipCode = formData.get("zipCode") as string;
  const city = formData.get("city") as string;
  const country = (formData.get("country") as string) || "DE";

  if (!name) {
    throw new Error("Vereinsname ist erforderlich");
  }

  const slug = await generateUniqueSlug(name);

  const address = street
    ? {
        street,
        zipCode,
        city,
        country,
      }
    : undefined;

  const club = await createClub({
    name,
    slug,
    contactEmail,
    website,
    address,
  });

  // Ensure user has a member record, create one if not
  let memberId = session.user.memberId;
  if (!memberId) {
    const newMember = await createMember({
      firstName: session.user.name?.split(" ")[0] || "Vorname",
      lastName: session.user.name?.split(" ").slice(1).join(" ") || "Nachname",
      email: session.user.email || contactEmail || "",
      status: "active",
      role: "admin",
      clubId: club.id,
    });
    memberId = newMember.id;

    // Link member to auth user and set clubId
    await updateAuthUser(session.user.id, { memberId: newMember.id, clubId: club.id });
  } else {
    // Update existing member with clubId
    await addMemberToClub(club.id, memberId, "admin", true);
    await updateAuthUser(session.user.id, { clubId: club.id });
  }

  revalidatePath("/dashboard");
  return { success: true, club };
}

export async function completeOnboardingAction(_formData?: FormData) {
  const club = await requireClub();
  
  const settings = (club.settings as Record<string, any>) || {};
  settings.onboardingCompleted = true;

  const { updateClub } = await import("./queries");
  await updateClub(club.id, { settings });

  revalidatePath("/dashboard");
}

export async function createClubAsSuperAdminAction(formData: FormData) {
  const session = await requireAuth();

  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

  const name = formData.get("name") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const website = formData.get("website") as string;
  const street = formData.get("street") as string;
  const zipCode = formData.get("zipCode") as string;
  const city = formData.get("city") as string;
  const country = (formData.get("country") as string) || "DE";

  if (!name) {
    throw new Error("Vereinsname ist erforderlich");
  }

  const slug = await generateUniqueSlug(name);

  const address = street
    ? {
        street,
        zipCode,
        city,
        country,
      }
    : undefined;

  const club = await createClub({
    name,
    slug,
    contactEmail,
    website,
    address,
  });

  revalidatePath("/super-admin");
  return { success: true, club };
}

export async function updateClubAction(formData: FormData) {
  const club = await requireClub();

  const name = formData.get("name") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const website = formData.get("website") as string;
  const contactEmail = formData.get("contactEmail") as string;

  const { updateClub } = await import("./queries");

  await updateClub(club.id, {
    name,
    logoUrl,
    website,
    contactEmail,
  });

  revalidatePath("/dashboard/club/settings");
  return { success: true };
}

// ─── Club Switching (DEPRECATED: Strict tenancy - one club per user) ──────────

export async function switchClubAction(clubId: string) {
  const session = await requireAuth();

  if (session.user.isSuperAdmin) {
    // Super-admins can still switch context for admin purposes
    await updateUserClub(session.user.id, clubId);
    return { success: true };
  }

  // Regular users cannot switch clubs under strict tenancy
  throw new Error("Wechsel zwischen Vereinen ist nicht erlaubt");
}

// ─── Member Management ─────────────────────────────────────────

export async function inviteMemberToClubAction(formData: FormData) {
  const session = await requireAuth();
  const club = await requireClub();

  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || "mitglied";

  if (!email) {
    throw new Error("E-Mail ist erforderlich");
  }

  // Check if email already belongs to a member of this club
  const [existingClubMember] = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.email, email), eq(members.clubId, club.id)));

  if (existingClubMember) {
    throw new Error("Mitglied ist bereits im Verein");
  }

  // Check if email belongs to a user in ANOTHER club (strict tenancy)
  const [otherClubMember] = await db
    .select({ id: members.id, clubId: members.clubId })
    .from(members)
    .where(eq(members.email, email));

  if (otherClubMember && otherClubMember.clubId && otherClubMember.clubId !== club.id) {
    throw new Error("Diese E-Mail ist bereits einem anderen Verein zugeordnet");
  }

  if (otherClubMember) {
    // Existing member in no club (unlikely) or same club (handled above)
    await db
      .update(members)
      .set({ clubId: club.id, role: role as typeof members.$inferInsert.role })
      .where(eq(members.id, otherClubMember.id));

    return {
      success: true,
      message: "Mitglied wurde zum Verein hinzugefuegt",
    };
  }

  // Create invitation for new user
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await createClubInvitation({
    clubId: club.id,
    email,
    role,
    invitedBy: session.user.memberId!,
    expiresAt,
  });

  // Send invitation email
  const { getInvitationUrl } = await import("@/lib/auth/invitations");
  await sendClubInvitationEmail({
    email,
    invitationUrl: getInvitationUrl(invitation.token),
    clubName: club.name,
    invitedByName: session.user.name,
  });

  return {
    success: true,
    message: "Einladung wurde versendet",
    invitationId: invitation.id,
  };
}

export async function removeMemberFromClubAction(memberId: string) {
  const session = await requireAuth();
  const club = await requireClub();

  // Prevent removing yourself
  if (memberId === session.user.memberId) {
    throw new Error("Sie koennen sich nicht selbst entfernen");
  }

  // Remove club association using strict tenancy (set clubId null)
  await db
    .update(members)
    .set({ clubId: null, updatedAt: new Date() })
    .where(and(eq(members.id, memberId), eq(members.clubId, club.id)));

  // Also update legacy membership record
  await db
    .update(clubMemberships)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(
      and(
        eq(clubMemberships.clubId, club.id),
        eq(clubMemberships.memberId, memberId)
      )
    );

  revalidatePath("/dashboard/club/members");
  return { success: true };
}

export async function updateMemberRoleAction(memberId: string, role: string) {
  const club = await requireClub();

  // Update role directly on members table (strict tenancy)
  await db
    .update(members)
    .set({ role: role as typeof members.$inferInsert.role, updatedAt: new Date() })
    .where(and(eq(members.id, memberId), eq(members.clubId, club.id)));

  // Also update legacy record during migration period
  await db
    .update(clubMemberships)
    .set({ role: role as typeof clubMemberships.$inferInsert.role, updatedAt: new Date() })
    .where(
      and(
        eq(clubMemberships.clubId, club.id),
        eq(clubMemberships.memberId, memberId)
      )
    );

  revalidatePath("/dashboard/club/members");
  return { success: true };
}

import { fetchClubMembersFromDsb } from "@/lib/dwz";

export async function importFromDsbAction(zps: string) {
  const session = await requireAuth();
  const club = await requireClub();

  const dsbMembers = await fetchClubMembersFromDsb(zps);
  
  // Note: DSB doesn't provide emails, so we create members with placeholder or empty emails
  // For the invitation system to work, we need emails. 
  // Strategy: We'll create the member records directly and they can be "claimed" later, 
  // or we just return them for the UI to let the admin add emails.
  
  // For this "intelligent onboarding", we will return the list so the admin can 
  // verify and potentially add emails for the most important members immediately.
  return {
    success: true,
    members: dsbMembers.map(m => ({
      firstName: m.firstName,
      lastName: m.lastName,
      dwz: m.dwz ?? undefined,
      dwzId: m.dwzId,
      email: "", // Admin must provide these
    }))
  };
}

export async function importMembersAction(membersToImport: { firstName: string; lastName: string; email: string; role: string; dwzId?: string; dwz?: number }[]) {
  const session = await requireAuth();
  const club = await requireClub();

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const memberData of membersToImport) {
    try {
      if (!memberData.email) {
        // Just create the member record if no email for invitation
        await db.insert(members).values({
          clubId: club.id,
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          email: `${memberData.dwzId || 'unknown'}@no-email.club`, // Placeholder
          dwz: memberData.dwz,
          dwzId: memberData.dwzId,
          role: (memberData.role || "mitglied") as any,
          status: "active",
        });
        results.success++;
        continue;
      }

      // Reuse existing invitation logic
      const formData = new FormData();
      formData.append("email", memberData.email);
      formData.append("role", memberData.role || "mitglied");
      
      await inviteMemberToClubAction(formData);
      
      // Update the newly created member (if any) with DWZ info
      // inviteMemberToClubAction creates a member or invitation. 
      // This part might need more surgical database updates if we want to store DWZ right away.
      
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`${memberData.email || memberData.lastName}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`);
    }
  }

  revalidatePath("/dashboard/club/members");
  return results;
}

// ─── Invitation Handling ─────────────────────────────────────

export async function acceptClubInvitationAction(token: string) {
  const session = await requireAuth();

  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    throw new Error("Ungueltige oder abgelaufene Einladung");
  }

  // Check if email matches
  const [userMember] = await db
    .select({ email: members.email })
    .from(members)
    .where(eq(members.id, session.user.memberId!));

  if (userMember?.email !== invitation.email) {
    throw new Error("Die Einladung wurde fuer eine andere E-Mail-Adresse erstellt");
  }

  // Set member.clubId for strict tenancy
  await db
    .update(members)
    .set({
      clubId: invitation.clubId,
      role: invitation.role as typeof members.$inferInsert.role,
      updatedAt: new Date(),
    })
    .where(eq(members.id, session.user.memberId!));

  // Update authUser.clubId
  await updateAuthUser(session.user.id, { clubId: invitation.clubId });

  // Add legacy membership record
  await addMemberToClub(
    invitation.clubId,
    session.user.memberId!,
    invitation.role
  );

  // Mark invitation as used
  await markInvitationUsed(invitation.id);

  return {
    success: true,
    club: invitation.club,
  };
}

// ─── Admin Invitation Management ─────────────────────────────

export async function getAllInvitationsAction() {
  const session = await requireAuth();

  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

  return db
    .select({
      id: clubInvitations.id,
      clubId: clubInvitations.clubId,
      email: clubInvitations.email,
      role: clubInvitations.role,
      token: clubInvitations.token,
      expiresAt: clubInvitations.expiresAt,
      usedAt: clubInvitations.usedAt,
      createdAt: clubInvitations.createdAt,
      clubName: clubs.name,
      invitedByName: sql<string>`COALESCE(${members.firstName} || ' ' || ${members.lastName}, 'Administration')`,
    })
    .from(clubInvitations)
    .innerJoin(clubs, eq(clubInvitations.clubId, clubs.id))
    .leftJoin(members, eq(clubInvitations.invitedBy, members.id))
    .orderBy(sql`${clubInvitations.createdAt} DESC`);
}

export async function getClubInvitationsAction() {
  const club = await requireClub();

  return db
    .select({
      id: clubInvitations.id,
      email: clubInvitations.email,
      role: clubInvitations.role,
      token: clubInvitations.token,
      expiresAt: clubInvitations.expiresAt,
      usedAt: clubInvitations.usedAt,
      createdAt: clubInvitations.createdAt,
      invitedByName: sql<string>`COALESCE(${members.firstName} || ' ' || ${members.lastName}, 'Administration')`,
    })
    .from(clubInvitations)
    .leftJoin(members, eq(clubInvitations.invitedBy, members.id))
    .where(eq(clubInvitations.clubId, club.id))
    .orderBy(sql`${clubInvitations.createdAt} DESC`);
}

export async function adminCreateInvitationAction(formData: FormData) {
  const session = await requireAuth();

  const clubId = formData.get("clubId") as string;
  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || "mitglied";
  const sendEmail = formData.get("sendEmail") === "true";

  if (!clubId || !email) {
    throw new Error("Verein und E-Mail sind erforderlich");
  }

  const club = await getClubById(clubId);
  if (!club) {
    throw new Error("Verein nicht gefunden");
  }

  // Super admin can specify any club; club admin uses clubCreateInvitationAction
  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

  const [existing] = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.email, email), eq(members.clubId, clubId)));

  if (existing) {
    throw new Error("Mitglied ist bereits im Verein");
  }

  const invitation = await createClubInvitation({
    clubId,
    email,
    role,
    invitedBy: session.user.memberId || "00000000-0000-0000-0000-000000000000",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const invitationUrl = getInvitationUrl(invitation.token);

  if (sendEmail) {
    await sendClubInvitationEmail({
      email,
      invitationUrl,
      clubName: club.name,
      invitedByName: session.user.name || "Administration",
    });
  }

  revalidatePath("/admin/einladungen");
  return { success: true, invitationId: invitation.id, invitationUrl };
}

export async function clubCreateInvitationAction(formData: FormData) {
  const session = await requireAuth();
  const club = await requireClub();

  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || "mitglied";
  const sendEmail = formData.get("sendEmail") === "true";

  if (!email) {
    throw new Error("E-Mail ist erforderlich");
  }

  const [existing] = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.email, email), eq(members.clubId, club.id)));

  if (existing) {
    throw new Error("Mitglied ist bereits im Verein");
  }

  const invitation = await createClubInvitation({
    clubId: club.id,
    email,
    role,
    invitedBy: session.user.memberId!,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const invitationUrl = getInvitationUrl(invitation.token);

  if (sendEmail) {
    await sendClubInvitationEmail({
      email,
      invitationUrl,
      clubName: club.name,
      invitedByName: session.user.name,
    });
  }

  revalidatePath("/dashboard/einladungen");
  return { success: true, invitationId: invitation.id, invitationUrl };
}

export async function revokeInvitationAction(invitationId: string) {
  const session = await requireAuth();

  const [invitation] = await db
    .select({ clubId: clubInvitations.clubId })
    .from(clubInvitations)
    .where(eq(clubInvitations.id, invitationId));

  if (!invitation) {
    throw new Error("Einladung nicht gefunden");
  }

  if (!session.user.isSuperAdmin) {
    // Club admin can only revoke invitations from their club
    const club = await requireClub();
    if (invitation.clubId !== club.id) {
      throw new Error("Nicht autorisiert");
    }
  }

  await db
    .delete(clubInvitations)
    .where(eq(clubInvitations.id, invitationId));

  revalidatePath("/admin/einladungen");
  revalidatePath("/dashboard/einladungen");
  return { success: true };
}

// ─── Super Admin ───────────────────────────────────────────────

export async function getAllClubsAction() {
  const session = await requireAuth();

  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

  try {
    const allClubs = await db
      .select({
        id: clubs.id,
        name: clubs.name,
        slug: clubs.slug,
        isActive: clubs.isActive,
        stripeCustomerId: clubs.stripeCustomerId,
        stripeConnectAccountId: clubs.stripeConnectAccountId,
        createdAt: clubs.createdAt,
        memberCount: sql<number>`(
          SELECT COUNT(*) FROM ${members}
          WHERE ${members.clubId} = ${clubs.id}
        )`,
      })
      .from(clubs)
      .orderBy(clubs.createdAt);

    return allClubs;
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error";
    const isPoolerError = errorMessage.includes("Tenant or user not found") || error.cause?.message?.includes("Tenant or user not found");
    
    console.error("Drizzle getAllClubs failed:", {
      message: errorMessage,
      cause: error.cause?.message,
      code: error.code || error.cause?.code,
      isPoolerError
    });

    if (isPoolerError) {
      console.warn("⚠️ InsForge Pooler Error: Bitte prüfe ob das Projekt pausiert ist.");
    }

    console.info("🔄 Falling back to InsForge REST API (Service Role)...");

    try {
      const client = createServiceClient();
      const { data, error: restError } = await client
        .from('clubs')
        .select('id, name, slug, is_active, stripe_customer_id, stripe_connect_account_id, created_at')
        .order('created_at');

      if (restError) {
        console.error("REST API fallback for clubs also failed:", restError.message);
        return [];
      }

      return (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        isActive: c.is_active,
        stripeCustomerId: c.stripe_customer_id,
        stripeConnectAccountId: c.stripe_connect_account_id,
        createdAt: c.created_at,
        memberCount: 0,
      }));
    } catch (fallbackError: any) {
      console.error("Failed to fetch clubs in getAllClubsAction fallback:", fallbackError.message);
      return [];
    }
  }
}

export async function getAllUsersAction() {
  const session = await requireAuth();

  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

  try {
    return await getAllAuthUsers();
  } catch (error: any) {
    console.error("Failed to fetch users in getAllUsersAction:", error.message);
    return [];
  }
}

export async function toggleClubStatusAction(clubId: string, isActive: boolean) {
  const session = await requireAuth();

  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

  await db
    .update(clubs)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(clubs.id, clubId));

  revalidatePath("/super-admin");
  return { success: true };
}

export async function impersonateClubAction(clubId: string) {
  const session = await requireAuth();

  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

  const club = await getClubById(clubId);
  if (!club) {
    throw new Error("Verein nicht gefunden");
  }

  // Set club as active for this session using strict tenancy
  await updateUserClub(session.user.id, clubId);

  return { success: true, club };
}
