import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { authUsers, members } from "@/lib/db/schema";
import { PERMISSIONS, hasPermission, getPermissionsForRole } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { updateUserRole } from "@/lib/actions/members";

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

const PERMISSION_GROUPS = [
  {
    title: "Mitglieder & Personen",
    permissions: [
      { key: "MEMBERS_READ", label: "Einsehen", description: "Mitgliederliste und Grunddaten lesen" },
      { key: "MEMBERS_READ_YOUTH", label: "Jugend-Fokus", description: "Nur Zugriff auf Jugendmitglieder" },
      { key: "MEMBERS_WRITE", label: "Bearbeiten", description: "Mitgliederdaten ändern" },
      { key: "MEMBERS_DELETE", label: "Löschen", description: "Mitglieder (deaktivieren) löschen" },
    ]
  },
  {
    title: "Sportbetrieb & Teams",
    permissions: [
      { key: "TEAMS_READ", label: "Teams sehen", description: "Mannschaften und Aufstellungen einsehen" },
      { key: "TEAMS_WRITE", label: "Teams verwalten", description: "Mannschaften erstellen/bearbeiten" },
      { key: "TEAMS_LINEUP", label: "Aufstellungen", description: "Meldelisten und Brettfolgen festlegen" },
      { key: "TOURNAMENTS_READ", label: "Turniere sehen", description: "Vereinsturniere einsehen" },
      { key: "TOURNAMENTS_WRITE", label: "Turniere verwalten", description: "Turniere erstellen und runden auslosen" },
      { key: "TOURNAMENTS_RESULTS", label: "Ergebnisse", description: "Ergebnisse in Turnieren eintragen" },
    ]
  },
  {
    title: "Finanzen & SEPA",
    permissions: [
      { key: "FINANCE_READ", label: "Finanzen sehen", description: "Zahlungsstatus und Beiträge einsehen" },
      { key: "FINANCE_WRITE", label: "Finanzen verwalten", description: "Beiträge und Rechnungen bearbeiten" },
      { key: "FINANCE_SEPA", label: "SEPA/Bank", description: "Bankdaten und SEPA-Mandate verwalten" },
    ]
  },
  {
    title: "Partien & DWZ",
    permissions: [
      { key: "GAMES_READ", label: "Partien sehen", description: "Partie-Archiv durchsuchen" },
      { key: "GAMES_WRITE", label: "Partien verwalten", description: "Partien bearbeiten oder löschen" },
      { key: "GAMES_IMPORT", label: "PGN-Import", description: "Massen-Upload von Partien" },
      { key: "DWZ_READ", label: "DWZ sehen", description: "DWZ/ELO Historie einsehen" },
      { key: "DWZ_SYNC", label: "DWZ Sync", description: "Manuellen DeWIS-Abgleich starten" },
    ]
  },
  {
    title: "System & Kommunikation",
    permissions: [
      { key: "EVENTS_READ", label: "Kalender sehen", description: "Vereinstermine einsehen" },
      { key: "EVENTS_WRITE", label: "Kalender verwalten", description: "Termine erstellen und bearbeiten" },
      { key: "ADMIN_USERS", label: "Benutzer-Admin", description: "Rollen und Berechtigungen anderer verwalten" },
      { key: "ADMIN_AUDIT", label: "Audit-Log", description: "Systemweite Protokolle einsehen" },
      { key: "PARENT_DASHBOARD", label: "Eltern-Portal", description: "Zugriff auf Daten der eigenen Kinder" },
    ]
  }
];

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

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions || [], PERMISSIONS.ADMIN_USERS)) {
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

      <form action={updateUserRole} className="space-y-8">
        <input type="hidden" name="userId" value={user.id} />

        {/* Role Selection Card */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Hauptrolle</h2>
            <p className="text-sm text-gray-500">Die Rolle bestimmt die Basis-Berechtigungen des Benutzers.</p>
          </div>
          <div className="p-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`relative flex cursor-pointer flex-col rounded-lg border p-4 focus:outline-none ${
                    user.role === r.value
                      ? "border-blue-600 ring-2 ring-blue-600 ring-opacity-10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    defaultChecked={user.role === r.value}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold text-gray-900">{r.label}</span>
                  <span className="mt-1 flex items-center text-xs text-gray-500">
                    {r.value === 'admin' ? 'Vollzugriff' : 'Eingeschränkt'}
                  </span>
                  {user.role === r.value && (
                    <div className="absolute right-3 top-3">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Permissions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Feingranulare Berechtigungen</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-green-100 ring-1 ring-green-600/20" />
                <span className="text-gray-600">Von Rolle geerbt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded border border-gray-300 bg-white" />
                <span className="text-gray-600">Individuell anpassbar</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.title} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">{group.title}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {group.permissions.map((perm) => {
                    const permValue = PERMISSIONS[perm.key as keyof typeof PERMISSIONS];
                    const hasByRole = rolePermissions.has(permValue);
                    const hasAdditional = additionalPermissions.includes(permValue);

                    return (
                      <label
                        key={perm.key}
                        className={`flex items-center justify-between px-6 py-4 transition-colors ${
                          hasByRole ? "bg-green-50/30" : "hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${hasByRole ? "text-green-900" : "text-gray-900"}`}>
                              {perm.label}
                            </span>
                            {hasByRole && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700 ring-1 ring-inset ring-green-600/20">
                                Aktiv
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{perm.description}</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="permissions"
                            value={permValue}
                            defaultChecked={hasByRole || hasAdditional}
                            disabled={hasByRole}
                            className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 ${
                              hasByRole ? "cursor-not-allowed opacity-50 bg-green-100 border-green-200" : ""
                            }`}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-6 flex items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-lg backdrop-blur-md">
          <Link
            href="/dashboard/admin/users"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Abbrechen
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Änderungen speichern
          </button>
        </div>
      </form>
    </div>
  );
}
