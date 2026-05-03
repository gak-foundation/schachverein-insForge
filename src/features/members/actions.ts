"use server";

import { createMemberSchema } from "@/lib/validations";
import { updateUserRoleSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";
import { logMemberAction } from "@/lib/audit";
import { createInvitation } from "@/lib/auth/invitations";
import { getSession } from "@/lib/auth/session";
import { PERMISSIONS, getPermissionsForRole, hasPermission } from "@/lib/auth/permissions";
import { fetchLichessProfile, getBestLichessRating } from "@/lib/lichess";
import { requireClubId } from "@/lib/actions/utils";
import { encrypt, decrypt } from "@/lib/crypto";
import { createServerClient, createServiceClient } from "@/lib/insforge";

// Define types used across the file
type ClubMemberRole = "admin" | "vorstand" | "mitglied" | "jugend" | "passiv";
type MemberRecordStatus = "active" | "inactive" | "resigned" | "honorary";

export type MemberSortField = "name" | "email" | "dwz" | "elo" | "role" | "status" | "createdAt";
export type SortOrder = "asc" | "desc";

export async function getMembers(
  search?: string,
  role?: string,
  status?: string,
  sortBy: MemberSortField = "name",
  sortOrder: SortOrder = "asc",
  page: number = 1,
  pageSize: number = 25
) {
  const clubId = await requireClubId();
  const offset = (page - 1) * pageSize;

  const client = createServiceClient();

  // We fetch memberships with joined members for the club filter
  let query = client
    .from('club_memberships')
    .select('role, members(*)', { count: 'exact' })
    .eq('club_id', clubId);

  if (role) {
    query = query.eq('role', role);
  }

  if (status) {
    query = query.eq('members.status', status);
  }

  if (search) {
    // Use or filter for search across first_name, last_name, email
    // InsForge supports or as a separate method in some versions, but let's use a simple approach
    // If or is not directly chainable, we may need to fetch and filter client-side for complex OR
    // However, InsForge supports `.or()` method
    query = query.or(`members.first_name.ilike.%${search}%,members.last_name.ilike.%${search}%,members.email.ilike.%${search}%`);
  }

  // Ordering
  const ascending = sortOrder === "asc";
  switch (sortBy) {
    case "name":
      query = query.order('last_name', { ascending }).order('first_name', { ascending });
      break;
    case "email":
      query = query.order('members.email', { ascending });
      break;
    case "dwz":
      query = query.order('members.dwz', { ascending });
      break;
    case "elo":
      query = query.order('members.elo', { ascending });
      break;
    case "role":
      query = query.order('role', { ascending });
      break;
    case "status":
      query = query.order('members.status', { ascending });
      break;
    case "createdAt":
      query = query.order('members.created_at', { ascending });
      break;
    default:
      query = query.order('members.created_at', { ascending: false });
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error || !data) {
    console.error("getMembers failed:", error);
    return { members: [], totalCount: 0, totalPages: 0 };
  }

  const membersList = data.map((item: any) => ({
    id: item.members.id,
    firstName: item.members.first_name,
    lastName: item.members.last_name,
    email: item.members.email,
    phone: item.members.phone,
    dateOfBirth: item.members.date_of_birth,
    gender: item.members.gender,
    dwz: item.members.dwz,
    elo: item.members.elo,
    dwzId: item.members.dwz_id,
    lichessUsername: item.members.lichess_username,
    chesscomUsername: item.members.chesscom_username,
    role: item.role,
    status: item.members.status,
    photoConsent: item.members.photo_consent,
    newsletterConsent: item.members.newsletter_consent,
    notes: item.members.notes,
    createdAt: item.members.created_at,
  }));

  return {
    members: membersList,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getMembersForForms() {
  const { members } = await getMembers(undefined, undefined, undefined, "name", "asc", 1, 10_000);
  return members;
}

export async function getMemberById(id: string) {
  const clubId = await requireClubId();
  const client = createServerClient();

  const { data: membership, error: membershipError } = await client
    .from('club_memberships')
    .select('*')
    .eq('member_id', id)
    .eq('club_id', clubId)
    .maybeSingle();

  if (membershipError) {
    console.error("getMemberById club_memberships failed:", membershipError.message);
    throw membershipError;
  }

  if (!membership) {
    return null;
  }

  const { data: memberData, error: memberError } = await client
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (memberError) {
    console.error("getMemberById members failed:", memberError.message);
    throw memberError;
  }

  const member = {
    ...memberData,
    membership,
  };

  if (member) {
    if (member.sepa_iban) member.sepa_iban = decrypt(member.sepa_iban);
    if (member.sepa_bic) member.sepa_bic = decrypt(member.sepa_bic);
    if (member.medical_notes) member.medical_notes = decrypt(member.medical_notes);
  }

  return member;
}

export async function getMemberStatusHistory(memberId: string) {
  const clubId = await requireClubId();
  const client = createServerClient();

  // Check if member belongs to club
  const { data: membership, error: membershipError } = await client
    .from('club_memberships')
    .select('*')
    .eq('member_id', memberId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    throw new Error("Mitglied nicht gefunden");
  }

  const { data, error } = await client
    .from('member_status_history')
    .select('*')
    .eq('member_id', memberId)
    .order('changed_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getContributionRatesForMemberSelect() {
  const clubId = await requireClubId();
  const client = createServerClient();

  const { data, error } = await client
    .from('contribution_rates')
    .select('id, name, amount')
    .eq('club_id', clubId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createMember(formData: FormData) {
  const clubId = await requireClubId();
  const session = await getSession();
  const client = createServerClient();

  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
    gender: (formData.get("gender") as string) || undefined,
    dwz: formData.get("dwz") ? Number(formData.get("dwz")) : undefined,
    elo: formData.get("elo") ? Number(formData.get("elo")) : undefined,
    dwzId: (formData.get("dwzId") as string) || undefined,
    lichessUsername: (formData.get("lichessUsername") as string) || undefined,
    chesscomUsername: (formData.get("chesscomUsername") as string) || undefined,
    role: (formData.get("role") as string) || "mitglied",
    status: (formData.get("status") as string) || "active",
    parentId: (formData.get("parentId") as string) || undefined,
    photoConsent: formData.get("photoConsent") === "on",
    newsletterConsent: formData.get("newsletterConsent") === "on",
    resultPublicationConsent: formData.get("resultPublicationConsent") !== null
      ? formData.get("resultPublicationConsent") === "on"
      : true,
    notes: (formData.get("notes") as string) || undefined,
    medicalNotes: (formData.get("medicalNotes") as string) || undefined,
    emergencyContactName: (formData.get("emergencyContactName") as string) || undefined,
    emergencyContactPhone: (formData.get("emergencyContactPhone") as string) || undefined,
    sepaIban: (formData.get("sepaIban") as string) || undefined,
    sepaBic: (formData.get("sepaBic") as string) || undefined,
    sepaMandateReference: (formData.get("sepaMandateReference") as string) || undefined,
    mandateSignedAt: (formData.get("mandateSignedAt") as string) || undefined,
    mandateUrl: (formData.get("mandateUrl") as string) || undefined,
    contributionRateId: (formData.get("contributionRateId") as string) || undefined,
  };

  const validated = createMemberSchema.parse(rawData);

  const { data: member, error: memberError } = await client
    .from('members')
    .insert([{
      first_name: validated.firstName,
      last_name: validated.lastName,
      email: validated.email,
      phone: validated.phone || null,
      date_of_birth: validated.dateOfBirth || null,
      gender: validated.gender || null,
      dwz: validated.dwz || null,
      elo: validated.elo || null,
      dwz_id: validated.dwzId || null,
      lichess_username: validated.lichessUsername || null,
      chesscom_username: validated.chesscomUsername || null,
      status: validated.status,
      parent_id: validated.parentId || null,
      photo_consent: validated.photoConsent,
      newsletter_consent: validated.newsletterConsent,
      result_publication_consent: validated.resultPublicationConsent,
      notes: validated.notes || null,
      medical_notes: validated.medicalNotes ? encrypt(validated.medicalNotes) : null,
      emergency_contact_name: validated.emergencyContactName || null,
      emergency_contact_phone: validated.emergencyContactPhone || null,
      sepa_iban: validated.sepaIban ? encrypt(validated.sepaIban) : null,
      sepa_bic: validated.sepaBic ? encrypt(validated.sepaBic) : null,
      sepa_mandate_reference: validated.sepaMandateReference || null,
      mandate_signed_at: validated.mandateSignedAt || null,
      mandate_url: validated.mandateUrl || null,
      contribution_rate_id: validated.contributionRateId || null,
    }])
    .select()
    .single();

  if (memberError || !member) {
    throw memberError || new Error("Mitglied konnte nicht erstellt werden");
  }

  const { error: membershipError } = await client
    .from('club_memberships')
    .insert([{
      club_id: clubId,
      member_id: member.id,
      role: validated.role,
    }]);

  if (membershipError) {
    throw membershipError;
  }

  // Record initial status in history
  const { error: historyError } = await client
    .from('member_status_history')
    .insert([{
      member_id: member.id,
      new_status: validated.status as MemberRecordStatus,
      reason: "Mitglied angelegt",
      changed_by: session?.user.memberId ?? null,
    }]);

  if (historyError) {
    throw historyError;
  }

  await logMemberAction("CREATED", member.id, {
    firstName: { old: null, new: member.first_name },
    lastName: { old: null, new: member.last_name },
    email: { old: null, new: member.email },
    role: { old: null, new: validated.role },
  });

  const createAccount = formData.get("createAccount") === "on";
  if (createAccount && session?.user.id) {
    const result = await createInvitation({
      clubId,
      email: validated.email,
      role: validated.role,
      invitedBy: session.user.id,
    });
    if (result) {
      const { getInvitationUrl } = await import("@/lib/auth/invitations");
      const invitationUrl = getInvitationUrl(result.token);
      console.log(`Einladung erstellt fuer ${validated.email}: ${invitationUrl}`);
    }
  }

  revalidatePath("/dashboard/members");
}

export async function deleteMember(id: string) {
  const clubId = await requireClubId();
  const session = await getSession();
  const client = createServerClient();

  const { data: membership, error: membershipError } = await client
    .from('club_memberships')
    .select('*')
    .eq('member_id', id)
    .eq('club_id', clubId)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    throw new Error("Mitglied nicht gefunden");
  }

  const member = await getMemberById(id);

  const { error: updateMembershipError } = await client
    .from('club_memberships')
    .update({ status: "inactive" })
    .eq('member_id', id)
    .eq('club_id', clubId);

  if (updateMembershipError) {
    throw updateMembershipError;
  }

  // Record status change in history
  if (member && member.status !== "inactive") {
    const { error: historyError } = await client
      .from('member_status_history')
      .insert([{
        member_id: id,
        old_status: member.status,
        new_status: "inactive",
        reason: "Mitglied deaktiviert (gelöscht)",
        changed_by: session?.user.memberId ?? null,
      }]);

    if (historyError) {
      throw historyError;
    }

    const { error: updateMemberError } = await client
      .from('members')
      .update({ status: "inactive" })
      .eq('id', id);

    if (updateMemberError) {
      throw updateMemberError;
    }
  }

  await logMemberAction("DELETED", id, {
    firstName: { old: member?.first_name, new: null },
    lastName: { old: member?.last_name, new: null },
    email: { old: member?.email, new: null },
  });

  revalidatePath("/dashboard/members");
}

export async function updateMember(formData: FormData) {
  const clubId = await requireClubId();
  const session = await getSession();
  const id = formData.get("id") as string;
  const client = createServerClient();

  const { data: membership, error: membershipError } = await client
    .from('club_memberships')
    .select('*')
    .eq('member_id', id)
    .eq('club_id', clubId)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    throw new Error("Mitglied nicht gefunden");
  }

  const currentMember = await getMemberById(id);
  if (!currentMember) throw new Error("Mitglied nicht gefunden");

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const dwz = formData.get("dwz") ? Number(formData.get("dwz")) : null;
  const status = formData.get("status") as string;
  const role = formData.get("role") as string;
  const medicalNotes = (formData.get("medicalNotes") as string) || null;
  const emergencyContactName = (formData.get("emergencyContactName") as string) || null;
  const emergencyContactPhone = (formData.get("emergencyContactPhone") as string) || null;
  const sepaIban = (formData.get("sepaIban") as string) || null;
  const sepaBic = (formData.get("sepaBic") as string) || null;
  const sepaMandateReference = (formData.get("sepaMandateReference") as string) || null;
  const mandateSignedAt = (formData.get("mandateSignedAt") as string) || null;
  const mandateUrl = (formData.get("mandateUrl") as string) || null;
  const contributionRateId = (formData.get("contributionRateId") as string) || null;

  // Record status change if it changed
  if (status !== currentMember.status) {
    const { error: historyError } = await client
      .from('member_status_history')
      .insert([{
        member_id: id,
        old_status: currentMember.status,
        new_status: status as MemberRecordStatus,
        reason: "Status manuell aktualisiert",
        changed_by: session?.user.memberId ?? null,
      }]);

    if (historyError) {
      throw historyError;
    }
  }

  const { error: updateMemberError } = await client
    .from('members')
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      dwz,
      status: status as MemberRecordStatus,
      medical_notes: medicalNotes ? encrypt(medicalNotes) : null,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      sepa_iban: sepaIban ? encrypt(sepaIban) : null,
      sepa_bic: sepaBic ? encrypt(sepaBic) : null,
      sepa_mandate_reference: sepaMandateReference,
      mandate_signed_at: mandateSignedAt,
      mandate_url: mandateUrl,
      contribution_rate_id: contributionRateId,
    })
    .eq('id', id);

  if (updateMemberError) {
    throw updateMemberError;
  }

  if (role) {
    const { error: updateRoleError } = await client
      .from('club_memberships')
      .update({ role: role as ClubMemberRole })
      .eq('member_id', id)
      .eq('club_id', clubId);

    if (updateRoleError) {
      throw updateRoleError;
    }
  }

  revalidatePath("/dashboard/members");
}

export async function getDWZHistory(memberId: string) {
  const clubId = await requireClubId();
  const client = createServerClient();

  // Check if member belongs to club
  const { data: membership, error: membershipError } = await client
    .from('club_memberships')
    .select('*')
    .eq('member_id', memberId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  const { data, error } = await client
    .from('dwz_history')
    .select('*')
    .eq('member_id', memberId)
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addDWZEntry(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServerClient();

  const memberId = formData.get("memberId") as string;
  const dwz = Number(formData.get("dwz"));
  const elo = formData.get("elo") ? Number(formData.get("elo")) : null;
  const source = (formData.get("source") as string) || "manual";
  const recordedAt = formData.get("recordedAt") as string;

  const { data: membership, error: membershipError } = await client
    .from('club_memberships')
    .select('*')
    .eq('member_id', memberId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  const { error: insertError } = await client
    .from('dwz_history')
    .insert([{
      member_id: memberId,
      dwz,
      elo,
      source,
      recorded_at: recordedAt,
    }]);

  if (insertError) {
    throw insertError;
  }

  const { error: updateError } = await client
    .from('members')
    .update({ dwz })
    .eq('id', memberId);

  if (updateError) {
    throw updateError;
  }

  revalidatePath("/dashboard/members");
}

import { fetchDwzData } from "@/lib/dwz";

export async function syncMemberDwz(memberId: string) {
  const client = createServerClient();

  const { data: member, error: memberError } = await client
    .from('members')
    .select('*')
    .eq('id', memberId)
    .single();

  if (memberError || !member) {
    return { success: false, error: "Keine DWZ-ID vorhanden" };
  }

  if (!member.dwz_id) {
    return { success: false, error: "Keine DWZ-ID vorhanden" };
  }

  const data = await fetchDwzData(member.dwz_id);
  if (!data) {
    return { success: false, error: "Daten konnten nicht von DeWIS abgerufen werden" };
  }

  // Only update if changed
  if (data.dwz !== member.dwz) {
    const { error: updateError } = await client
      .from('members')
      .update({ dwz: data.dwz })
      .eq('id', memberId);

    if (updateError) {
      throw updateError;
    }

    const { error: insertError } = await client
      .from('dwz_history')
      .insert([{
        member_id: memberId,
        dwz: data.dwz,
        elo: member.elo,
        source: "dewis-sync",
        recorded_at: new Date().toISOString().split("T")[0],
      }]);

    if (insertError) {
      throw insertError;
    }

    return { success: true, oldDwz: member.dwz, newDwz: data.dwz };
  }

  return { success: true, changed: false };
}

export async function syncAllMembersDwz() {
  const clubId = await requireClubId();
  const client = createServerClient();

  const { data: allMembersWithId, error } = await client
    .from('members')
    .select('id, dwz_id, club_memberships!inner(club_id)')
    .eq('club_memberships.club_id', clubId)
    .not('dwz_id', 'is', null);

  if (error) {
    throw error;
  }

  let updatedCount = 0;
  let errorCount = 0;

  for (const m of (allMembersWithId || [])) {
    try {
      const result = await syncMemberDwz(m.id);
      if (result.success && result.newDwz !== undefined) {
        updatedCount++;
      }
    } catch (err) {
      console.error("Error syncing member %s:", m.id, err);
      errorCount++;
    }
    // Rate limiting to avoid blocking
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  revalidatePath("/dashboard/members");
  return { updatedCount, errorCount, total: (allMembersWithId || []).length };
}

const ALL_PERMISSION_VALUES = new Set(Object.values(PERMISSIONS));

export async function updateUserRole(formData: FormData) {
  const session = await getSession();
  if (
    !session ||
    !hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.ADMIN_USERS, session.user.isSuperAdmin)
  ) {
    throw new Error("Nicht autorisiert");
  }

  const permissionsRaw = formData.getAll("permissions").map(String);
  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    permissions: permissionsRaw,
  });

  if (!parsed.success) {
    throw new Error("Ungueltige Eingaben");
  }

  const { userId, role } = parsed.data;
  const rolePermSet = new Set(getPermissionsForRole(role));
  const additional = parsed.data.permissions.filter(
    (p) => ALL_PERMISSION_VALUES.has(p as (typeof PERMISSIONS)[keyof typeof PERMISSIONS]) && !rolePermSet.has(p as never),
  );

  const client = createServerClient();

  const { error } = await client
    .from('auth_users')
    .update({
      role: role,
      permissions: additional,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}/edit`);
}

export async function syncLichessRating(memberId: string) {
  const clubId = await requireClubId();
  const client = createServerClient();

  const { data: result, error } = await client
    .from('members')
    .select('lichess_username, dwz, club_memberships!inner(club_id)')
    .eq('id', memberId)
    .eq('club_memberships.club_id', clubId)
    .single();

  if (error || !result || !result.lichess_username) {
    throw new Error("Mitglied nicht gefunden oder kein Lichess-Benutzername hinterlegt");
  }

  const profile = await fetchLichessProfile(result.lichess_username);
  if (!profile) {
    throw new Error("Lichess-Profil konnte nicht abgerufen werden");
  }

  const newElo = getBestLichessRating(profile);
  if (newElo === null) {
    throw new Error("Keine relevanten Ratings auf Lichess gefunden");
  }

  // Update member ELO
  const { error: updateError } = await client
    .from('members')
    .update({ elo: newElo })
    .eq('id', memberId);

  if (updateError) {
    throw updateError;
  }

  // Add history entry
  const { error: insertError } = await client
    .from('dwz_history')
    .insert([{
      member_id: memberId,
      dwz: result.dwz ?? 0,
      elo: newElo,
      source: "lichess-sync",
      recorded_at: new Date().toISOString().split("T")[0],
    }]);

  if (insertError) {
    throw insertError;
  }

  revalidatePath(`/dashboard/members/${memberId}`);
  return { success: true, newElo };
}
