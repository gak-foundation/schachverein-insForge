"use server";

import { createServiceClient } from "@/lib/insforge";
import { withTenant } from "@/lib/tenant/with-tenant";
import { PERMISSIONS } from "@/lib/auth/permissions";

export async function getUsers(search?: string, roleFilter?: string) {
  return withTenant(PERMISSIONS.ADMIN_USERS, async ({ user }) => {
    const client = createServiceClient();

    let query = client
      .from("members")
      .select("id, first_name, last_name, email, role, status, club_id, created_at")
      .eq("club_id", user.clubId)
      .order("created_at", { ascending: false });

    if (search) {
      const escapedSearch = search.replace(/[%_]/g, "\\$&");
      query = query.or(
        `first_name.ilike.%${escapedSearch}%,last_name.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching members:", error);
      return [];
    }

    const members = (data || []).map((m: any) => ({
      id: m.id,
      firstName: m.first_name,
      lastName: m.last_name,
      name: `${m.first_name} ${m.last_name}`.trim(),
      email: m.email,
      role: m.role,
      status: m.status,
      clubId: m.club_id,
      createdAt: m.created_at,
    }));

    if (roleFilter) {
      return members.filter((m) => m.role === roleFilter);
    }

    return members;
  });
}
