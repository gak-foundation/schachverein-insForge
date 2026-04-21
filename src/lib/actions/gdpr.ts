"use server";

import { db } from "@/lib/db";
import {
  members,
  clubMemberships,
  authUsers,
  payments,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { logMemberAction } from "@/lib/audit";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";

/**
 * Requests deletion of the current user's account and member data.
 * Sets a timestamp for the request.
 */
export async function requestAccountDeletion() {
  const session = await getSession();
  if (!session || !session.user.memberId) {
    throw new Error("Nicht autorisiert");
  }

  const memberId = session.user.memberId;

  await db
    .update(members)
    .set({
      deletionRequestedAt: new Date(),
      status: "inactive",
    })
    .where(eq(members.id, memberId));

  // Log the request
  await logMemberAction("DELETION_REQUESTED", memberId, {
    status: { old: "active", new: "inactive" },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

/**
 * Exports all personal data related to a member in JSON format.
 * Requirement: Right to data portability (Art. 20 GDPR).
 */
export async function exportMemberData(memberId: string) {
  const session = await getSession();
  // Only the member themselves or a super admin can export data
  if (!session || (session.user.memberId !== memberId && !session.user.isSuperAdmin)) {
    throw new Error("Nicht autorisiert");
  }

  const memberData = await db.query.members.findFirst({
    where: eq(members.id, memberId),
    with: {
      clubMemberships: true,
      dwzEntries: true,
      statusHistory: true,
    },
  });

  if (!memberData) {
    throw new Error("Mitglied nicht gefunden");
  }

  const paymentRecords = await db
    .select()
    .from(payments)
    .where(eq(payments.memberId, memberId));

  const exportBlob = {
    personalData: {
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email,
      phone: memberData.phone,
      dateOfBirth: memberData.dateOfBirth,
      gender: memberData.gender,
      dwz: memberData.dwz,
      elo: memberData.elo,
      fideId: memberData.fideId,
      joinedAt: memberData.joinedAt,
    },
    memberships: memberData.clubMemberships,
    dwzHistory: memberData.dwzEntries,
    statusHistory: memberData.statusHistory,
    payments: paymentRecords,
    exportedAt: new Date().toISOString(),
  };

  return exportBlob;
}

/**
 * Anonymizes a member record. 
 * Requirement: Right to be forgotten (Art. 17 GDPR).
 * Personal data is overwritten with placeholders, but the record is kept
 * to maintain referential integrity (e.g. for tournament pairings).
 */
export async function anonymizeMember(memberId: string) {
  const session = await getSession();
  
  if (!session) {
    throw new Error("Nicht autorisiert");
  }

  // Allow if super admin OR if user has MEMBERS_DELETE permission
  const hasAuth = session.user.isSuperAdmin || 
    hasPermission(
      session.user.role ?? "mitglied", 
      session.user.permissions ?? [], 
      PERMISSIONS.MEMBERS_DELETE,
      session.user.isSuperAdmin
    );

  if (!hasAuth) {
    throw new Error("Nur Administratoren mit entsprechenden Rechten können Daten anonymisieren.");
  }

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId));

  if (!member) {
    throw new Error("Mitglied nicht gefunden");
  }

  // 1. Delete associated auth user (this cascades to sessions/accounts)
  await db.delete(authUsers).where(eq(authUsers.memberId, memberId));

  // 2. Anonymize sensitive fields in members table
  await db
    .update(members)
    .set({
      firstName: "Anonymes",
      lastName: `Mitglied ${memberId.slice(0, 4)}`,
      email: `anonymized-${memberId.slice(0, 8)}@checkmate-manager.de`,
      phone: null,
      dateOfBirth: null,
      gender: null,
      dwzId: null,
      fideId: null,
      lichessUsername: null,
      chesscomUsername: null,
      sepaIban: null,
      sepaBic: null,
      sepaMandateReference: null,
      mandateSignedAt: null,
      notes: null,
      status: "inactive",
      anonymizedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(members.id, memberId));

  // 3. Clear memberships but keep record for historical purposes
  await db
    .update(clubMemberships)
    .set({ status: "inactive" })
    .where(eq(clubMemberships.memberId, memberId));

  await logMemberAction("ANONYMIZED", memberId, {});

  revalidatePath("/dashboard/members");
  return { success: true };
}
