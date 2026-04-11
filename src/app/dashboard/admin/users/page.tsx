import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, members } from "@/lib/db/schema";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { eq, desc, ilike, or } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";

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

async function getUsers(search?: string, roleFilter?: string) {
  const conditions = [];

  if (search) {
    const escapedSearch = search.replace(/[%_]/g, "\\$&");
    conditions.push(
      or(
        ilike(users.name, `%${escapedSearch}%`),
        ilike(users.email, `%${escapedSearch}%`),
      ),
    );
  }

  if (roleFilter) {
    conditions.push(eq(users.role, roleFilter as typeof users.role.enumValues[number]));
  }

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      permissions: users.permissions,
      memberId: users.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(members, eq(users.memberId, members.id))
    .where(conditions.length > 0 ? or(...conditions) : undefined)
    .orderBy(desc(users.createdAt));
}

function UsersTable({ users: userList }: { users: Awaited<ReturnType<typeof getUsers>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              E-Mail
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Rolle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Zusätzliche Berechtigungen
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {userList.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—"}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-600">{user.email}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                  {ROLES.find((r) => r.value === user.role)?.label || user.role}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-600">
                  {user.permissions?.length ? (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {user.permissions.length} Berechtigung{user.permissions.length > 1 ? "en" : ""}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <Link
                  href={`/dashboard/admin/users/${user.id}/edit`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Bearbeiten
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              E-Mail
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Rolle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Zusätzliche Berechtigungen
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function UsersContent({
  search,
  role,
}: {
  search?: string;
  role?: string;
}) {
  const userList = await getUsers(search, role);

  return (
    <>
      {userList.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <p className="text-gray-600">Keine Benutzer gefunden</p>
        </div>
      ) : (
        <UsersTable users={userList} />
      )}
    </>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session.user.role, session.user.permissions || [], PERMISSIONS.ADMIN_USERS)) {
    redirect("/dashboard");
  }

  const { search, role } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
        <p className="mt-1 text-sm text-gray-600">
          Verwalte Rollen und Berechtigungen aller Benutzer
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Name oder E-Mail suchen..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            name="role"
            defaultValue={role || ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Alle Rollen</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Filtern
        </button>
        {(search || role) && (
          <Link
            href="/dashboard/admin/users"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Filter zurücksetzen
          </Link>
        )}
      </form>

      <div className="rounded-lg border border-gray-200">
        <Suspense fallback={<UsersTableSkeleton />}>
          <UsersContent search={search} role={role} />
        </Suspense>
      </div>
    </div>
  );
}
