import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { authUsers, members } from "@/lib/db/schema";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { UserEditForm } from "./user-edit-form";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "vorstand", label: "Vorstand" },
  { value: "sportwart", label: "Sportwart" },
  { value: "jugendwart", label: "Jugendwart" },
  { value: "kassenwart", label: "Kassenwart" },
  { value: "trainer", label: "Trainer" },
  { value: "mitglied", label: "Mitglied" },
  { value: "eltern", label: "Eltern" },
] as const;

async function getUserById(id: string) {
  const [user] = await db
    .select({
      id: authUsers.id,
      name: authUsers.name,
      email: authUsers.email,
      role: authUsers.role,
      permissions: authUsers.permissions,
      memberId: authUsers.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
    })
    .from(authUsers)
    .leftJoin(members, eq(authUsers.memberId, members.id))
    .where(eq(authUsers.id, id));

  return user;
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions || [], PERMISSIONS.ADMIN_USERS, session.user.isSuperAdmin)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    redirect("/dashboard/admin/users");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/dashboard/admin/users" className="hover:text-gray-900">
              Benutzerverwaltung
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Rechte bearbeiten</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-500">{user.email}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {ROLES.find((r) => r.value === user.role)?.label || user.role}
            </span>
          </div>
        </div>
      </div>

      <UserEditForm user={user} />
    </div>
  );
}
