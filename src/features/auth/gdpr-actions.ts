"use server";

import { createServiceClient } from "@/lib/insforge";
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
  const client = createServiceClient();

  const { error } = await client
    .from("members")
    .update({
      deletion_requested_at: new Date().toISOString(),
      status: "inactive",
    })
    .eq("id", memberId);

  if (error) {
    console.error("Error requesting account deletion:", error);
    throw new Error("Fehler beim Löschauftrag");
  }

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
  if (!session || (session.user.memberId !== memberId && session.user.role !== "admin")) {
    throw new Error("Nicht autorisiert");
  }

  const client = createServiceClient();

  // Fetch member with related data
  const { data: memberData, error: memberError } = await client
    .from("members")
    .select("*, club_memberships(*), dwz_history(*), member_status_history(*)")
    .eq("id", memberId)
    .single();

  if (memberError || !memberData) {
    throw new Error("Mitglied nicht gefunden");
  }

  const { data: paymentRecords, error: paymentError } = await client
    .from("payments")
    .select("*")
    .eq("member_id", memberId);

  if (paymentError) {
    console.error("Error fetching payments:", paymentError);
  }

  const exportBlob = {
    personalData: {
      firstName: memberData.first_name,
      lastName: memberData.last_name,
      email: memberData.email,
      phone: memberData.phone,
      dateOfBirth: memberData.date_of_birth,
      gender: memberData.gender,
      dwz: memberData.dwz,
      elo: memberData.elo,
      fideId: memberData.fide_id,
      joinedAt: memberData.joined_at,
    },
    memberships: memberData.club_memberships,
    dwzHistory: memberData.dwz_history,
    statusHistory: memberData.member_status_history,
    payments: paymentRecords || [],
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
  const hasAuth = session.user.role === "admin" || 
    hasPermission(
      session.user.role ?? "mitglied", 
      session.user.permissions ?? [], 
      PERMISSIONS.MEMBERS_DELETE);

  if (!hasAuth) {
    throw new Error("Nur Administratoren mit entsprechenden Rechten können Daten anonymisieren.");
  }

  const client = createServiceClient();

  // Check member exists
  const { data: member, error: memberError } = await client
    .from("members")
    .select("id")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    throw new Error("Mitglied nicht gefunden");
  }

  // 1. Delete associated auth user (this cascades to sessions/accounts)
  const { error: deleteError } = await client
    .from("auth_user")
    .delete()
    .eq("member_id", memberId);

  if (deleteError) {
    console.error("Error deleting auth user:", deleteError);
  }

  // 2. Anonymize sensitive fields in members table
  const { error: updateError } = await client
    .from("members")
    .update({
      first_name: "Anonymes",
      last_name: `Mitglied ${memberId.slice(0, 4)}`,
      email: `anonymized-${memberId.slice(0, 8)}@checkmate-manager.de`,
      phone: null,
      date_of_birth: null,
      gender: null,
      dwz_id: null,
      fide_id: null,
      lichess_username: null,
      chesscom_username: null,
      sepa_iban: null,
      sepa_bic: null,
      sepa_mandate_reference: null,
      mandate_signed_at: null,
      notes: null,
      status: "inactive",
      anonymized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (updateError) {
    console.error("Error anonymizing member:", updateError);
    throw new Error("Fehler bei der Anonymisierung");
  }

  // 3. Clear memberships but keep record for historical purposes
  const { error: membershipError } = await client
    .from("club_memberships")
    .update({ status: "inactive" })
    .eq("member_id", memberId);

  if (membershipError) {
    console.error("Error updating memberships:", membershipError);
  }

  await logMemberAction("ANONYMIZED", memberId, {});

  revalidatePath("/dashboard/members");
  return { success: true };
}
