"use server";

import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clubs,
  clubMemberships,
  members,
  authUsers,
} from "@/lib/db/schema";
import { getAllAuthUsers, updateAuthUser } from "@/lib/db/queries/auth";
import { requireAuth, requireClub } from "@/lib/auth/session";
import { sendClubInvitationEmail } from "@/lib/auth/email";
import { revalidatePath } from "next/cache";
import {
  createClub,
  generateUniqueSlug,
  addMemberToClub,
  createClubInvitation,
  getInvitationByToken,
  markInvitationUsed,
  updateUserClub,
  getClubById,
} from "./queries";

// ─── Club CRUD ─────────────────────────────────────────────────

export async function createClubAction(formData: FormData) {
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

  // Ensure user has a member record, create one if not
  let memberId = session.user.memberId;
  if (!memberId) {
    const [newMember] = await db
      .insert(members)
      .values({
        firstName: session.user.name?.split(" ")[0] || "Vorname",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "Nachname",
        email: session.user.email || contactEmail || "",
        status: "active",
        role: "admin",
        clubId: club.id,
      })
      .returning({ id: members.id });
    memberId = newMember.id;

    // Link member to auth user and set clubId
    await updateAuthUser(session.user.id, { memberId: newMember.id, clubId: club.id });
  } else {
    // Update existing member with clubId
    await db.update(members).set({ clubId: club.id, role: "admin" }).where(eq(members.id, memberId));
    await updateAuthUser(session.user.id, { clubId: club.id });
  }

  // Add creator as admin (legacy record for migration period)
  await addMemberToClub(club.id, memberId, "admin", true);

  revalidatePath("/dashboard");
  return { success: true, club };
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

// ─── Super Admin ───────────────────────────────────────────────

export async function getAllClubsAction() {
  const session = await requireAuth();

  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

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
}

export async function getAllUsersAction() {
  const session = await requireAuth();

  if (!session.user.isSuperAdmin) {
    throw new Error("Nicht autorisiert");
  }

  return getAllAuthUsers();
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
