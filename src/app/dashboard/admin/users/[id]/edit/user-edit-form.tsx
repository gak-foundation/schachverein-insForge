"use client";

import { useState } from "react";
import { PERMISSIONS, getPermissionsForRole, ROLES, Permission } from "@/lib/auth/permissions";
import { updateUserRole } from "@/features/members/actions";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    title: "Website & Inhalte",
    permissions: [
      { key: "PAGES_READ", label: "Inhalte sehen", description: "Öffentliche Seiten im Entwurf sehen" },
      { key: "PAGES_WRITE", label: "Inhalte bearbeiten", description: "Seiten und Artikel erstellen/bearbeiten" },
      { key: "PAGES_PUBLISH", label: "Veröffentlichen", description: "Inhalte live schalten" },
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

interface UserEditFormProps {
  user: {
    id: string;
    role: string;
    permissions: string[] | null;
  };
}

export function UserEditForm({ user }: UserEditFormProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const initialRolePermissions = getPermissionsForRole(user.role);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(() => {
    const combined = new Set([...initialRolePermissions, ...(user.permissions || [])]);
    return Array.from(combined);
  });

  const rolePermissions = new Set(getPermissionsForRole(selectedRole));

  const handleRoleChange = (role: string) => {
    const newRolePerms = getPermissionsForRole(role);
    setSelectedRole(role);
    const updated = new Set([...selectedPermissions, ...newRolePerms]);
    setSelectedPermissions(Array.from(updated));
  };

  const togglePermission = (perm: string) => {
    if (rolePermissions.has(perm as Permission)) return;

    setSelectedPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm) 
        : [...prev, perm]
    );
  };

  return (
    <form action={updateUserRole} className="space-y-8">
      <input type="hidden" name="userId" value={user.id} />
      
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Hauptrolle</h2>
          <p className="text-sm text-gray-500">Die Rolle bestimmt die Basis-Berechtigungen des Benutzers.</p>
        </div>
        <div className="p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <div key={r.value} className="relative">
                <input
                  type="radio"
                  id={`role-${r.value}`}
                  name="role"
                  value={r.value}
                  checked={selectedRole === r.value}
                  onChange={() => handleRoleChange(r.value)}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`role-${r.value}`}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-lg border p-4 transition-all",
                    "peer-checked:border-blue-600 peer-checked:ring-2 peer-checked:ring-blue-600 peer-checked:ring-opacity-10 peer-checked:bg-blue-50/30",
                    "hover:border-gray-300 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2",
                    selectedRole === r.value ? "border-blue-600" : "border-gray-200"
                  )}
                >
                  <span className={cn("block text-sm font-semibold", selectedRole === r.value ? "text-blue-900" : "text-gray-900")}>
                    {r.label}
                  </span>
                  <span className="mt-1 flex items-center text-xs text-gray-500">
                    {r.value === 'admin' ? 'Vollzugriff' : 'Eingeschränkt'}
                  </span>
                  {selectedRole === r.value && (
                    <div className="absolute right-3 top-3">
                      <div className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Feingranulare Berechtigungen</h2>
          <div className="flex items-center gap-4 text-xs" aria-hidden="true">
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
            <section key={group.title} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">{group.title}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {group.permissions.map((perm) => {
                  const permValue = PERMISSIONS[perm.key as keyof typeof PERMISSIONS];
                  const hasByRole = rolePermissions.has(permValue);
                  const isChecked = selectedPermissions.includes(permValue) || hasByRole;
                  const id = `perm-${perm.key}`;

                  return (
                    <div
                      key={perm.key}
                      className={cn(
                        "flex items-center justify-between px-6 py-4 transition-colors",
                        hasByRole ? "bg-green-50/30" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={id} className={cn("text-sm font-semibold cursor-pointer", hasByRole ? "text-green-900" : "text-gray-900")}>
                            {perm.label}
                          </Label>
                          {hasByRole && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700 ring-1 ring-inset ring-green-600/20">
                              Geerbt
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{perm.description}</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={id}
                          name="permissions"
                          value={permValue}
                          checked={isChecked}
                          onChange={() => togglePermission(permValue)}
                          className={cn(
                            "h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600",
                            hasByRole ? "opacity-50 bg-green-100 border-green-200 cursor-not-allowed" : "cursor-pointer"
                          )}
                          aria-describedby={hasByRole ? undefined : undefined}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="sticky bottom-6 flex items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-lg backdrop-blur-md">
        <Link
          href="/dashboard/admin/users"
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 outline-none"
        >
          Abbrechen
        </Link>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 h-10 px-6 font-semibold shadow-sm"
        >
          Änderungen speichern
        </Button>
      </div>
    </form>
  );
}
