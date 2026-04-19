import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { authUsers, members } from "@/lib/db/schema";
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

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 ring-purple-600/20",
  vorstand: "bg-blue-100 text-blue-700 ring-blue-600/20",
  sportwart: "bg-green-100 text-green-700 ring-green-600/20",
  jugendwart: "bg-orange-100 text-orange-700 ring-orange-600/20",
  kassenwart: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  trainer: "bg-indigo-100 text-indigo-700 ring-indigo-600/20",
  mitglied: "bg-gray-100 text-gray-700 ring-gray-600/20",
  eltern: "bg-pink-100 text-pink-700 ring-pink-600/20",
};

async function getUsers(search?: string, roleFilter?: string) {
  const conditions = [];

  if (search) {
    const escapedSearch = search.replace(/[%_]/g, "\\$&");
    conditions.push(
      or(
        ilike(authUsers.name, `%${escapedSearch}%`),
        ilike(authUsers.email, `%${escapedSearch}%`),
      ),
    );
  }

  if (roleFilter) {
    conditions.push(eq(authUsers.role, roleFilter as typeof authUsers.role.enumValues[number]));
  }

  return db
    .select({
      id: authUsers.id,
      name: authUsers.name,
      email: authUsers.email,
      role: authUsers.role,
      permissions: authUsers.permissions,
      memberId: authUsers.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
      createdAt: authUsers.createdAt,
    })
    .from(authUsers)
    .leftJoin(members, eq(authUsers.memberId, members.id))
    .where(conditions.length > 0 ? or(...conditions) : undefined)
    .orderBy(desc(authUsers.createdAt));
}

function UsersTable({ authUsers: userList }: { authUsers: Awaited<ReturnType<typeof getUsers>> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              Benutzer
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              Rolle
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              Rechte-Status
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {userList.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unbekannt"}
                  </span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${ROLE_STYLES[user.role] || ROLE_STYLES.mitglied}`}>
                  {ROLES.find((r) => r.value === user.role)?.label || user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {user.permissions?.length ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      <span className="h-1 w-1 rounded-full bg-blue-600" />
                      +{user.permissions.length} Custom
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Standard</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/dashboard/admin/users/${user.id}/edit`}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all"
                >
                  Verwalten
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
        <UsersTable authUsers={userList} />
      )}
    </>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions || [], PERMISSIONS.ADMIN_USERS)) {
    redirect("/dashboard");
  }

  const { search, role } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Benutzerverwaltung</h1>
          <p className="mt-1 text-sm text-gray-500">
            Systemweite Rollenverteilung und feingranulare Berechtigungen steuern.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <form className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Name oder E-Mail-Adresse..."
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="min-w-[160px]">
            <select
              name="role"
              defaultValue={role || ""}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 px-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
            className="inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all"
          >
            Filtern
          </button>
          {(search || role) && (
            <Link
              href="/dashboard/admin/users"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Zurücksetzen
            </Link>
          )}
        </form>
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersContent search={search} role={role} />
      </Suspense>
    </div>
  );
}
