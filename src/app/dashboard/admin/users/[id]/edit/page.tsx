import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, members } from "@/lib/db/schema";
import { PERMISSIONS, hasPermission, getPermissionsForRole } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { updateUserRole } from "@/lib/actions";

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

const ALL_PERMISSIONS = [
  { key: "MEMBERS_READ", label: "Mitglieder anzeigen" },
  { key: "MEMBERS_READ_YOUTH", label: "Jugendmitglieder anzeigen" },
  { key: "MEMBERS_WRITE", label: "Mitglieder bearbeiten" },
  { key: "MEMBERS_DELETE", label: "Mitglieder löschen" },
  { key: "FINANCE_READ", label: "Finanzen anzeigen" },
  { key: "FINANCE_WRITE", label: "Finanzen bearbeiten" },
  { key: "FINANCE_SEPA", label: "SEPA-Mandate verwalten" },
  { key: "TEAMS_READ", label: "Mannschaften anzeigen" },
  { key: "TEAMS_WRITE", label: "Mannschaften bearbeiten" },
  { key: "TEAMS_LINEUP", label: "Aufstellung verwalten" },
  { key: "TOURNAMENTS_READ", label: "Turniere anzeigen" },
  { key: "TOURNAMENTS_WRITE", label: "Turniere bearbeiten" },
  { key: "TOURNAMENTS_RESULTS", label: "Turnierergebnisse eingeben" },
  { key: "GAMES_READ", label: "Partien anzeigen" },
  { key: "GAMES_WRITE", label: "Partien bearbeiten" },
  { key: "GAMES_IMPORT", label: "PGN-Import" },
  { key: "EVENTS_READ", label: "Termine anzeigen" },
  { key: "EVENTS_WRITE", label: "Termine bearbeiten" },
  { key: "DWZ_READ", label: "DWZ anzeigen" },
  { key: "DWZ_SYNC", label: "DWZ synchronisieren" },
  { key: "ADMIN_USERS", label: "Benutzerverwaltung" },
  { key: "ADMIN_ROLES", label: "Rollenverwaltung" },
  { key: "ADMIN_AUDIT", label: "Audit-Log anzeigen" },
  { key: "ADMIN_SETTINGS", label: "Einstellungen" },
  { key: "PARENT_DASHBOARD", label: "Eltern-Dashboard" },
] as const;

async function getUserById(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      permissions: users.permissions,
      memberId: users.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
    })
    .from(users)
    .leftJoin(members, eq(users.memberId, members.id))
    .where(eq(users.id, id));

  return user;
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session.user.role, session.user.permissions || [], PERMISSIONS.ADMIN_USERS)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    redirect("/dashboard/admin/users");
  }

  const rolePermissions = new Set(getPermissionsForRole(user.role));
  const additionalPermissions = user.permissions || [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/dashboard/admin/users" className="hover:text-gray-900">
            Benutzer
          </Link>
          <span>/</span>
          <span>Bearbeiten</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Rolle und Berechtigungen bearbeiten
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <form action={updateUserRole} className="space-y-6">
          <input type="hidden" name="userId" value={user.id} />

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Benutzerinformationen</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                <p className="mt-1 text-sm text-gray-600">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Aktuelle Rolle</label>
                <p className="mt-1 text-sm text-gray-600">
                  {ROLES.find((r) => r.value === user.role)?.label || user.role}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900">Rolle ändern</h2>
            <div className="mt-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Neue Rolle
              </label>
              <select
                id="role"
                name="role"
                defaultValue={user.role}
                className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Jede Rolle hat vordefinierte Berechtigungen. Zusätzliche Berechtigungen können unten vergeben werden.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900">Zusätzliche Berechtigungen</h2>
            <p className="mt-1 text-sm text-gray-600">
              Wähle Berechtigungen, die über die Rollen-Berechtigungen hinausgehen sollen.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ALL_PERMISSIONS.map((perm) => {
                const permValue = PERMISSIONS[perm.key as keyof typeof PERMISSIONS];
                const hasByRole = rolePermissions.has(permValue);
                const hasAdditional = additionalPermissions.includes(permValue);

                return (
                  <label
                    key={perm.key}
                    className={`flex items-start gap-3 rounded-md border p-3 ${
                      hasByRole
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="permissions"
                      value={permValue}
                      defaultChecked={hasByRole || hasAdditional}
                      disabled={hasByRole}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${hasByRole ? "text-green-900" : "text-gray-900"}`}>
                        {perm.label}
                      </span>
                      {hasByRole && (
                        <span className="ml-2 inline-flex rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                          Rolle
                        </span>
                      )}
                      <p className="text-xs text-gray-500">{permValue}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t pt-6">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Speichern
            </button>
            <Link
              href="/dashboard/admin/users"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Abbrechen
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-blue-900">Berechtigungen der aktuellen Rolle</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from(rolePermissions).map((perm) => (
            <span
              key={perm}
              className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
            >
              {perm}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
