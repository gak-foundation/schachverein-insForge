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
import { requireAuth, requireClub } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
  createClub,
  generateUniqueSlug,
  addMemberToClub,
  createClubInvitation,
  getInvitationByToken,
  markInvitationUsed,
  getClubBySlug,
  updateUserActiveClub,
  getClubById,
} from "./queries";

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

  // Add creator as admin
  if (session.user.memberId) {
    await addMemberToClub(club.id, session.user.memberId, "admin", true);
  }

  // Set as active club
  await updateUserActiveClub(session.user.id, club.id);

  revalidatePath("/dashboard");
  return { success: true, club };
}

export async function updateClubAction(formData: FormData) {
  const session = await requireAuth();
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

// ─── Club Switching ────────────────────────────────────────────

export async function switchClubAction(clubId: string) {
  const session = await requireAuth();

  // Verify user is member of this club
  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.clubId, clubId),
        eq(clubMemberships.memberId, session.user.memberId!),
        eq(clubMemberships.status, "active")
      )
    );

  if (!membership && !session.user.isSuperAdmin) {
    throw new Error("Kein Zugriff auf diesen Verein");
  }

  await updateUserActiveClub(session.user.id, clubId);

  return { success: true };
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

  // Check if member already exists
  const [existingMember] = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.email, email));

  if (existingMember) {
    // Check if already member of this club
    const [existingMembership] = await db
      .select()
      .from(clubMemberships)
      .where(
        and(
          eq(clubMemberships.clubId, club.id),
          eq(clubMemberships.memberId, existingMember.id)
        )
      );

    if (existingMembership) {
      throw new Error("Mitglied ist bereits im Verein");
    }

    // Add existing member to club
    await addMemberToClub(club.id, existingMember.id, role);

    return {
      success: true,
      message: "Mitglied wurde zum Verein hinzugefügt",
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

  // TODO: Send invitation email
  console.log(`Invitation created: ${invitation.token}`);

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
    throw new Error("Sie können sich nicht selbst entfernen");
  }

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
  const session = await requireAuth();
  const club = await requireClub();

  await db
    .update(clubMemberships)
    .set({ role: role as any, updatedAt: new Date() })
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
    throw new Error("Ungültige oder abgelaufene Einladung");
  }

  // Check if email matches
  const [userMember] = await db
    .select({ email: members.email })
    .from(members)
    .where(eq(members.id, session.user.memberId!));

  if (userMember?.email !== invitation.email) {
    throw new Error("Die Einladung wurde für eine andere E-Mail-Adresse erstellt");
  }

  // Add member to club
  await addMemberToClub(
    invitation.clubId,
    session.user.memberId!,
    invitation.role
  );

  // Mark invitation as used
  await markInvitationUsed(invitation.id);

  // Set as active club if no active club
  if (!session.user.activeClubId) {
    await updateUserActiveClub(session.user.id, invitation.clubId);
  }

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
      plan: clubs.plan,
      isActive: clubs.isActive,
      subscriptionStatus: clubs.subscriptionStatus,
      subscriptionExpiresAt: clubs.subscriptionExpiresAt,
      createdAt: clubs.createdAt,
      memberCount: sql<number>`(
        SELECT COUNT(*) FROM ${clubMemberships}
        WHERE ${clubMemberships.clubId} = ${clubs.id}
        AND ${clubMemberships.status} = 'active'
      )`,
    })
    .from(clubs)
    .orderBy(clubs.createdAt);

  return allClubs;
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

  // Set club as active for this session
  await updateUserActiveClub(session.user.id, clubId);

  return { success: true, club };
}
