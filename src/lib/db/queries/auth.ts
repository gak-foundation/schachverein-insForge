import { createServiceClient } from "@/lib/insforge";

export async function getAuthUserById(id: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("auth_user")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error in getAuthUserById:", error);
    return null;
  }
  return data;
}

export async function getAuthUserWithClub(id: string) {
  const client = createServiceClient();
  const { data, error } = await client
    .from("auth_user")
    .select(
      "id, name, email, email_verified, image, role, permissions, member_id, club_id"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error in getAuthUserWithClub:", error);
    return null;
  }

  let role = data.role;

  if (data.member_id && data.club_id) {
    const { data: membership, error: membershipError } = await client
      .from("club_memberships")
      .select("role")
      .eq("member_id", data.member_id)
      .eq("club_id", data.club_id)
      .maybeSingle();

    if (!membershipError && membership?.role) {
      if (data.role !== "admin") {
        role = membership.role;
      }
    }
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    emailVerified: data.email_verified || false,
    image: data.image,
    role,
    permissions: data.permissions || [],
    memberId: data.member_id,
    clubId: data.club_id,
  };
}

export async function updateAuthUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    image: string;
    role: string;
    permissions: string[];
    memberId: string;
    clubId: string;
  }>
) {
  const client = createServiceClient();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.permissions !== undefined) updateData.permissions = data.permissions;
  if (data.memberId !== undefined) updateData.member_id = data.memberId;
  if (data.clubId !== undefined) updateData.club_id = data.clubId;
  const { data: updated, error } = await client
    .from("auth_user")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    console.error("Error in updateAuthUser:", error);
    return null;
  }

  return {
    ...updated,
    emailVerified: updated.email_verified,
    memberId: updated.member_id,
    clubId: updated.club_id,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  };
}

export async function ensureAuthUser(userData: {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  clubId?: string;
}) {
  const client = createServiceClient();

  const { data: existing, error: lookupError } = await client
    .from("auth_user")
    .select("id")
    .eq("id", userData.id)
    .maybeSingle();

  if (lookupError) {
    console.error("Error looking up auth user:", lookupError);
    return null;
  }

  if (existing) {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (userData.email) updateData.email = userData.email;
    if (userData.name) updateData.name = userData.name;
    if (userData.avatarUrl) updateData.image = userData.avatarUrl;
    if (userData.emailVerified !== undefined)
      updateData.email_verified = userData.emailVerified;
    if (userData.clubId) updateData.club_id = userData.clubId;

    const { data: updated, error: updateError } = await client
      .from("auth_user")
      .update(updateData)
      .eq("id", userData.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating auth user:", updateError);
      return null;
    }
    return updated;
  }

  const { data: created, error: insertError } = await client
    .from("auth_user")
    .insert([
      {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.email?.split("@")[0],
        image: userData.avatarUrl,
        email_verified: userData.emailVerified ?? false,
        role: "mitglied",
        club_id: userData.clubId,
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error("Error creating auth user:", insertError);
    return null;
  }

  return created;
}
