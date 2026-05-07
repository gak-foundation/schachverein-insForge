import { createServiceClient } from "@/lib/insforge";

export async function getUsers(search?: string, roleFilter?: string, clubId?: string) {
  const client = createServiceClient();
  let query = client
    .from("auth_user")
    .select("id, name, email, role, permissions, member_id, club_id, created_at, members(first_name, last_name)")
    .order("created_at", { ascending: false });

  if (clubId) {
    query = query.eq("club_id", clubId);
  }

  if (search) {
    const escapedSearch = search.replace(/[%_]/g, "\\$&");
    query = query.or(`name.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  const users = await Promise.all((data || []).map(async (u: any) => {
    let effectiveRole = u.role;
    if (u.member_id && u.club_id) {
      const { data: membership } = await client
        .from("club_memberships")
        .select("role")
        .eq("member_id", u.member_id)
        .eq("club_id", u.club_id)
        .maybeSingle();
      if (membership?.role) effectiveRole = membership.role;
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: effectiveRole,
      permissions: u.permissions,
      memberId: u.member_id,
      clubId: u.club_id,
      firstName: u.members?.first_name ?? null,
      lastName: u.members?.last_name ?? null,
      createdAt: u.created_at,
    };
  }));

  if (roleFilter) {
    return users.filter((u) => u.role === roleFilter);
  }

  return users;
}
