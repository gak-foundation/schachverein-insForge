"use server";

import { requireAuth, requireClub } from "@/lib/auth/session";
import { sendClubInvitationEmail } from "@/lib/auth/email";
import { createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
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
import { updateAuthUser } from "@/lib/db/queries/auth";

// --- Club CRUD -------------------------------------------------

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

  let memberId = session.user.memberId;
  if (!memberId) {
    const newMember = await createMember({
      firstName: session.user.name?.split(" ")[0] || "Vorname",
      lastName: session.user.name?.split(" ").slice(1).join(" ") || "Nachname",
      email: session.user.email || contactEmail || "",
      status: "active",
      clubId: club.id,
    });
    memberId = newMember.id;

    await addMemberToClub(club.id, memberId, "admin", true);
    await updateAuthUser(session.user.id, { memberId: newMember.id, clubId: club.id });
  } else {
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

export async function createClubAsAdminAction(formData: FormData) {
  const session = await requireAuth();

  if (session.user.role !== "admin") {
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

  revalidatePath("/admin");
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

// --- Club Switching (DEPRECATED: Strict tenancy - one club per user) ----------

export async function switchClubAction(clubId: string) {
  const session = await requireAuth();

  if (session.user.role === "admin") {
    await updateUserClub(session.user.id, clubId);
    return { success: true };
  }

  throw new Error("Wechsel zwischen Vereinen ist nicht erlaubt");
}

// --- Member Management -----------------------------------------

export async function inviteMemberToClubAction(formData: FormData) {
  const session = await requireAuth();
  const club = await requireClub();

  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || "mitglied";

  if (!email) {
    throw new Error("E-Mail ist erforderlich");
  }

  const client = createServiceClient();

  const { data: existingClubMember } = await client
    .from("members")
    .select("id")
    .eq("email", email)
    .eq("club_id", club.id)
    .maybeSingle();

  if (existingClubMember) {
    throw new Error("Mitglied ist bereits im Verein");
  }

  const { data: otherClubMember } = await client
    .from("members")
    .select("id, club_id")
    .eq("email", email)
    .maybeSingle();

  if (otherClubMember && otherClubMember.club_id && otherClubMember.club_id !== club.id) {
    throw new Error("Diese E-Mail ist bereits einem anderen Verein zugeordnet");
  }

  if (otherClubMember) {
    const { error } = await client
      .from("members")
      .update({ club_id: club.id })
      .eq("id", otherClubMember.id);

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: "Mitglied wurde zum Verein hinzugefuegt",
    };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await createClubInvitation({
    clubId: club.id,
    email,
    role,
    invitedBy: session.user.memberId!,
    expiresAt,
  });

  const { getInvitationUrl: getUrl } = await import("@/lib/auth/invitations");
  await sendClubInvitationEmail({
    email,
    invitationUrl: getUrl(invitation.token),
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

  if (memberId === session.user.memberId) {
    throw new Error("Sie koennen sich nicht selbst entfernen");
  }

  const client = createServiceClient();

  const { error: memberError } = await client
    .from("members")
    .update({ club_id: null, updated_at: new Date().toISOString() })
    .eq("id", memberId)
    .eq("club_id", club.id);

  if (memberError) throw new Error(memberError.message);

  const { error: membershipError } = await client
    .from("club_memberships")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("club_id", club.id)
    .eq("member_id", memberId);

  if (membershipError) throw new Error(membershipError.message);

  revalidatePath("/dashboard/club/members");
  return { success: true };
}

export async function updateMemberRoleAction(memberId: string, role: string) {
  const club = await requireClub();

  const client = createServiceClient();

  const { error: membershipError } = await client
    .from("club_memberships")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("club_id", club.id)
    .eq("member_id", memberId);

  if (membershipError) throw new Error(membershipError.message);

  revalidatePath("/dashboard/club/members");
  return { success: true };
}

import { fetchClubMembersFromDsb } from "@/lib/dwz";

export async function importFromDsbAction(zps: string) {
  const session = await requireAuth();
  const club = await requireClub();

  const dsbMembers = await fetchClubMembersFromDsb(zps);

  return {
    success: true,
    members: dsbMembers.map((m) => ({
      firstName: m.firstName,
      lastName: m.lastName,
      dwz: m.dwz ?? undefined,
      dwzId: m.dwzId,
      email: "",
    })),
  };
}

export async function importMembersAction(
  membersToImport: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    dwzId?: string;
    dwz?: number;
  }[]
) {
  const session = await requireAuth();
  const club = await requireClub();

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  const client = createServiceClient();

  for (const memberData of membersToImport) {
    try {
      if (!memberData.email) {
        const { data: newMember, error } = await client.from("members").insert([
          {
            club_id: club.id,
            first_name: memberData.firstName,
            last_name: memberData.lastName,
            email: `${memberData.dwzId || "unknown"}@no-email.club`,
            dwz: memberData.dwz,
            dwz_id: memberData.dwzId,
            status: "active",
          },
        ]).select().single();

        if (error) throw new Error(error.message);

        const { error: membershipError } = await client
          .from("club_memberships")
          .upsert({
            club_id: club.id,
            member_id: newMember.id,
            role: memberData.role || "mitglied",
            status: "active",
            updated_at: new Date().toISOString(),
          });

        if (membershipError) throw new Error(membershipError.message);
        results.success++;
        continue;
      }

      const formData = new FormData();
      formData.append("email", memberData.email);
      formData.append("role", memberData.role || "mitglied");

      await inviteMemberToClubAction(formData);

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(
        `${memberData.email || memberData.lastName}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`
      );
    }
  }

  revalidatePath("/dashboard/club/members");
  return results;
}

// --- Invitation Handling -------------------------------------

export async function acceptClubInvitationAction(token: string) {
  const session = await requireAuth();

  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    throw new Error("Ungueltige oder abgelaufene Einladung");
  }

  const client = createServiceClient();

  const { data: userMember } = await client
    .from("members")
    .select("email")
    .eq("id", session.user.memberId!)
    .single();

  if (userMember?.email !== invitation.email) {
    throw new Error("Die Einladung wurde fuer eine andere E-Mail-Adresse erstellt");
  }

  const { error: updateError } = await client
    .from("members")
    .update({
      club_id: invitation.clubId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.user.memberId!);

  if (updateError) throw new Error(updateError.message);

  await updateAuthUser(session.user.id, { clubId: invitation.clubId });

  await addMemberToClub(invitation.clubId, session.user.memberId!, invitation.role);

  await markInvitationUsed(invitation.id);

  return {
    success: true,
    club: invitation.club,
  };
}

// --- Admin Invitation Management -----------------------------

export async function getAllInvitationsAction() {
  const session = await requireAuth();

  if (session.user.role !== "admin") {
    throw new Error("Nicht autorisiert");
  }

  const client = createServiceClient();

  const { data, error } = await client
    .from("club_invitations")
    .select("*, clubs(name), members(first_name, last_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch invitations:", error.message);
    return [];
  }

  return (data || []).map((inv: any) => ({
    id: inv.id,
    clubId: inv.club_id,
    email: inv.email,
    role: inv.role,
    token: inv.token,
    expiresAt: inv.expires_at,
    usedAt: inv.used_at,
    createdAt: inv.created_at,
    clubName: inv.clubs?.name,
    invitedByName: inv.members
      ? `${inv.members.first_name || ""} ${inv.members.last_name || ""}`.trim() || "Administration"
      : "Administration",
  }));
}

export async function getClubInvitationsAction() {
  const club = await requireClub();

  const client = createServiceClient();

  const { data, error } = await client
    .from("club_invitations")
    .select("*, members(first_name, last_name)")
    .eq("club_id", club.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch club invitations:", error.message);
    return [];
  }

  return (data || []).map((inv: any) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    token: inv.token,
    expiresAt: inv.expires_at,
    usedAt: inv.used_at,
    createdAt: inv.created_at,
    invitedByName: inv.members
      ? `${inv.members.first_name || ""} ${inv.members.last_name || ""}`.trim() || "Administration"
      : "Administration",
  }));
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

  if (session.user.role !== "admin") {
    throw new Error("Nicht autorisiert");
  }

  const client = createServiceClient();

  const { data: existing } = await client
    .from("members")
    .select("id")
    .eq("email", email)
    .eq("club_id", clubId)
    .maybeSingle();

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

  const client = createServiceClient();

  const { data: existing } = await client
    .from("members")
    .select("id")
    .eq("email", email)
    .eq("club_id", club.id)
    .maybeSingle();

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

  const client = createServiceClient();

  const { data: invitation } = await client
    .from("club_invitations")
    .select("club_id")
    .eq("id", invitationId)
    .maybeSingle();

  if (!invitation) {
    throw new Error("Einladung nicht gefunden");
  }

  if (session.user.role !== "admin") {
    const club = await requireClub();
    if (invitation.club_id !== club.id) {
      throw new Error("Nicht autorisiert");
    }
  }

  const { error } = await client.from("club_invitations").delete().eq("id", invitationId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/einladungen");
  revalidatePath("/dashboard/einladungen");
  return { success: true };
}

// --- Admin -----------------------------------------------

export async function getAllClubsAction() {
  const session = await requireAuth();

  if (session.user.role !== "admin") {
    throw new Error("Nicht autorisiert");
  }

  const client = createServiceClient();

  try {
    const { data: allClubs, error: clubsError } = await client
      .from("clubs")
      .select("id, name, slug, is_active, stripe_customer_id, stripe_connect_account_id, created_at")
      .order("created_at");

    if (clubsError) throw clubsError;

    const { data: allMembers, error: membersError } = await client
      .from("members")
      .select("club_id");

    if (membersError) {
      console.error("Failed to fetch members for club stats:", membersError.message);
    }

    const memberCountMap = new Map<string, number>();
    allMembers?.forEach((m: any) => {
      if (m.club_id) {
        memberCountMap.set(m.club_id, (memberCountMap.get(m.club_id) || 0) + 1);
      }
    });

    return (allClubs || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      isActive: c.is_active,
      stripeCustomerId: c.stripe_customer_id,
      stripeConnectAccountId: c.stripe_connect_account_id,
      createdAt: c.created_at,
      memberCount: memberCountMap.get(c.id) || 0,
    }));
  } catch (error: any) {
    console.error("Failed to fetch clubs in getAllClubsAction:", error.message);
    return [];
  }
}

export async function getAllUsersAction() {
  const session = await requireAuth();

  if (session.user.role !== "admin") {
    throw new Error("Nicht autorisiert");
  }

  const client = createServiceClient();

  try {
    const { data, error } = await client
      .from("members")
      .select("id, first_name, last_name, email, status, club_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch users in getAllUsersAction:", error.message);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      name: `${m.first_name || ""} ${m.last_name || ""}`.trim() || m.email,
      email: m.email,
      role: m.status === "active" ? "mitglied" : "inactive",
      createdAt: m.created_at,
      lastLoginAt: null,
    }));
  } catch (error: any) {
    console.error("Failed to fetch users in getAllUsersAction:", error.message);
    return [];
  }
}

export async function toggleClubStatusAction(clubId: string, isActive: boolean) {
  const session = await requireAuth();

  if (session.user.role !== "admin") {
    throw new Error("Nicht autorisiert");
  }

  const client = createServiceClient();

  const { error } = await client
    .from("clubs")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", clubId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { success: true };
}

// Helper: Generate random token (32 bytes = 64 hex chars)
async function generateToken(): Promise<string> {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: SHA-256 hash as hex string
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: HMAC-SHA256 sign
async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const IMPERSONATION_MAX_PER_HOUR = 10;
const IMPERSONATION_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function impersonateClubAction(clubId: string) {
  const session = await requireAuth();

  if (session.user.role !== "admin") {
    throw new Error("Nicht autorisiert");
  }

  const club = await getClubById(clubId);
  if (!club) {
    throw new Error("Verein nicht gefunden");
  }

  if (!club.is_active) {
    throw new Error("Verein ist inaktiv");
  }

  const secret = process.env.IMPERSONATION_SECRET;
  if (!secret) {
    throw new Error("Impersonation ist nicht konfiguriert");
  }

  const client = createServiceClient();

  // Rate limiting: count sessions started in the last hour
  const oneHourAgo = new Date(Date.now() - IMPERSONATION_DURATION_MS).toISOString();
  const { count, error: countError } = await client
    .from("impersonation_sessions")
    .select("*", { count: "exact", head: true })
    .eq("admin_id", session.user.id)
    .gte("started_at", oneHourAgo);

  if (countError) {
    console.error("Rate limit check failed:", countError.message);
    throw new Error("Interner Fehler bei der Rate-Limit-Pr?fung");
  }

  if ((count ?? 0) >= IMPERSONATION_MAX_PER_HOUR) {
    throw new Error("Rate-Limit erreicht: Maximal 10 Impersonationen pro Stunde");
  }

  // Generate token and hashes
  const token = await generateToken();
  const tokenHash = await sha256Hex(token);
  const sig = await hmacSign(token, secret);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + IMPERSONATION_DURATION_MS);

  // Create server-side session record
  const { error: insertError } = await client.from("impersonation_sessions").insert({
    admin_id: session.user.id,
    target_club_id: clubId,
    token_hash: tokenHash,
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    revoked: false,
  });

  if (insertError) {
    console.error("Failed to create impersonation session:", insertError.message);
    throw new Error("Impersonation-Session konnte nicht erstellt werden");
  }

  // Set cookies
  const cookieStore = await cookies();
  cookieStore.set("impersonation_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });
  cookieStore.set("impersonation_sig", sig, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });

  // Audit log
  try {
    await client.from("audit_log").insert({
      user_id: session.user.id,
      club_id: clubId,
      action: "IMPERSONATION_STARTED",
      entity: "club",
      entity_id: clubId,
      changes: { clubName: club.name, adminId: session.user.id },
    });
  } catch {
    // Silent fail for audit
  }

  return { success: true, club };
}

export async function unimpersonateClubAction() {
  const session = await requireAuth();
  const cookieStore = await cookies();
  const token = cookieStore.get("impersonation_token")?.value;

  if (token) {
    const tokenHash = await sha256Hex(token);
    const client = createServiceClient();

    // Find and close the active session
    const { data: sessionData } = await client
      .from("impersonation_sessions")
      .select("target_club_id")
      .eq("token_hash", tokenHash)
      .eq("admin_id", session.user.id)
      .is("ended_at", null)
      .eq("revoked", false)
      .single();

    if (sessionData) {
      await client
        .from("impersonation_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("token_hash", tokenHash);

      try {
        await client.from("audit_log").insert({
          user_id: session.user.id,
          club_id: sessionData.target_club_id,
          action: "IMPERSONATION_ENDED",
          entity: "club",
          entity_id: sessionData.target_club_id,
          changes: {},
        });
      } catch {
        // Silent fail for audit
      }
    }
  }

  cookieStore.delete("impersonation_token");
  cookieStore.delete("impersonation_sig");

  return { success: true };
}



