import { createServiceClient } from "@/lib/insforge";

// ─── Club Query Helpers ─────────────────────────────────────────

export async function getClubById(id: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error in getClubById:", error);
    return null;
  }
  return data;
}

export async function getClubBySlug(slug: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error in getClubBySlug:", error);
    return null;
  }
  return data;
}

export async function getClubByStripeCustomerId(stripeCustomerId: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("clubs")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  if (error) {
    console.error("Error in getClubByStripeCustomerId:", error);
    return null;
  }
  return data;
}

export async function getUserClubs(userId: string) {
  const client = createServiceClient();

  // First get the user's club info from auth_user
  const { data: userData, error: userError } = await client
    .from("auth_user")
    .select("club_id, member_id")
    .eq("id", userId)
    .single();

  if (userError || !userData?.club_id) return [];

  // Then get the club and membership details
  const [{ data: clubData }, { data: memberData }] = await Promise.all([
    client.from("clubs").select("*").eq("id", userData.club_id).single(),
    client
      .from("members")
      .select("role")
      .eq("id", userData.member_id)
      .single(),
  ]);

  if (!clubData) return [];

  return [
    {
      id: clubData.id,
      name: clubData.name,
      slug: clubData.slug,
      logoUrl: clubData.logo_url,
      plan: clubData.plan,
      isActive: clubData.is_active,
      membershipRole: memberData?.role || "mitglied",
      isPrimary: true,
    },
  ];
}

export async function getUserPrimaryClub(userId: string) {
  const client = createServiceClient();

  const { data: userData, error: userError } = await client
    .from("auth_user")
    .select("club_id")
    .eq("id", userId)
    .single();

  if (userError || !userData?.club_id) return null;

  const { data: clubData, error: clubError } = await client
    .from("clubs")
    .select("*")
    .eq("id", userData.club_id)
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

// ─── Club Filtering Functions ──────────────────────────────────

export async function isMemberOfClub(memberId: string, clubId: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("members")
    .select("id")
    .eq("id", memberId)
    .eq("club_id", clubId)
    .single();

  if (error) return false;
  return !!data;
}

export async function getClubRole(memberId: string, clubId: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("members")
    .select("role")
    .eq("id", memberId)
    .eq("club_id", clubId)
    .single();

  if (error || !data) return null;
  return data.role;
}

// ─── Club Data Access ───────────────────────────────────────────

export async function getMembersByClub(clubId: string, search?: string) {
  const client = createServiceClient();
  let query = client
    .from("members")
    .select(
      "id, first_name, last_name, email, phone, status, role, dwz, joined_at"
    )
    .eq("club_id", clubId)
    .order("last_name", { ascending: true });

  if (search) {
    // InsForge supports ilike for search
    query = query.ilike("first_name", `%${search}%`);
    // Note: For multi-column search, we might need a different approach
    // or use an OR filter if the SDK supports it
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error in getMembersByClub:", error);
    return [];
  }

  return data || [];
}

export async function getEventsByClub(clubId: string, limit?: number) {
  const client = createServiceClient();
  let query = client
    .from("events")
    .select("id, title, event_type, start_date, end_date, location, is_all_day")
    .eq("club_id", clubId)
    .order("start_date", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error in getEventsByClub:", error);
    return [];
  }

  return data || [];
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
  const client = createServiceClient();
  const { data: club, error } = await client
    .from("clubs")
    .insert({
      name: data.name,
      slug: data.slug,
      contact_email: data.contactEmail,
      website: data.website,
      address: data.address,
    })
    .select()
    .single();

  if (error) {
    console.error("Error in createClub:", error);
    throw error;
  }

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
  const client = createServiceClient();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.contactEmail !== undefined)
    updateData.contact_email = data.contactEmail;
  if (data.settings !== undefined) updateData.settings = data.settings;

  const { data: club, error } = await client
    .from("clubs")
    .update(updateData)
    .eq("id", clubId)
    .select()
    .single();

  if (error) {
    console.error("Error in updateClub:", error);
    throw error;
  }

  return club;
}

export async function updateUserClub(userId: string, clubId: string | null) {
  const client = createServiceClient();
  const { error } = await client
    .from("auth_user")
    .update({
      club_id: clubId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error in updateUserClub:", error);
    throw error;
  }
}

export async function createMember(data: {
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
  role?: string;
  clubId?: string;
}) {
  const client = createServiceClient();
  const { data: member, error } = await client
    .from("members")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      status: data.status || "active",
      role: data.role || "mitglied",
      club_id: data.clubId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error in createMember:", error);
    throw error;
  }

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

export async function addMemberToClub(
  clubId: string,
  memberId: string,
  role: string = "mitglied",
  isPrimary: boolean = false
) {
  const client = createServiceClient();

  // Update member's club
  const { error: memberError } = await client
    .from("members")
    .update({
      club_id: clubId,
      role: role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (memberError) {
    console.error("Error updating member club:", memberError);
    throw memberError;
  }

  // Upsert membership using insert with onConflict
  const { data: membership, error } = await client
    .from("club_memberships")
    .upsert({
      club_id: clubId,
      member_id: memberId,
      role: role,
      is_primary: isPrimary,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error in addMemberToClub:", error);
    throw error;
  }

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
  const client = createServiceClient();

  const { data: invitation, error } = await client
    .from("club_invitations")
    .insert({
      club_id: data.clubId,
      email: data.email,
      role: data.role || "mitglied",
      invited_by: data.invitedBy,
      token,
      expires_at: data.expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error in createClubInvitation:", error);
    throw error;
  }

  return invitation;
}

export async function getInvitationByToken(token: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("club_invitations")
    .select("*, clubs(id, name)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .is("used_at", null)
    .single();

  if (error || !data) {
    console.error("Error in getInvitationByToken:", error);
    return null;
  }

  return data;
}

export async function markInvitationUsed(invitationId: string) {
  const client = createServiceClient();
  const { error } = await client
    .from("club_invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invitationId);

  if (error) {
    console.error("Error in markInvitationUsed:", error);
    throw error;
  }
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
  const client = createServiceClient();
  const { data, error } = await client
    .from("clubs")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error in isSlugAvailable:", error);
    return false;
  }

  return !data;
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
  const client = createServiceClient();
  const { count, error } = await client
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubId);

  if (error) {
    console.error("Error in getClubMemberCount:", error);
    return 0;
  }

  return count ?? 0;
}
