import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/auth/permissions";

export async function withTenant<T>(
  permission: Permission,
  action: (ctx: { user: { id: string; role: string; permissions: string[]; clubId: string } }) => Promise<T>
): Promise<T> {
  const session = await requireAuth();
  const user = session.user;

  if (!user.clubId) {
    redirect("/onboarding");
  }

  if (!hasPermission(user.role ?? "mitglied", user.permissions ?? [], permission)) {
    throw new Error("FORBIDDEN");
  }

  // Tenant isolation is enforced at the application layer through explicit
  // club_id filters in database queries. setTenantContext is not used here
  // because PostgREST/HTTP clients do not support session-scoped set_config.

  return action({
    user: {
      id: user.id,
      role: user.role ?? "mitglied",
      permissions: user.permissions ?? [],
      clubId: user.clubId,
    },
  });
}
