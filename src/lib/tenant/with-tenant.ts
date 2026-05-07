import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { setTenantContext } from "./set-context";

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

  await setTenantContext(user.clubId);

  return action({
    user: {
      id: user.id,
      role: user.role ?? "mitglied",
      permissions: user.permissions ?? [],
      clubId: user.clubId,
    },
  });
}
