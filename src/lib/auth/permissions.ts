// ─── RBAC Permission Matrix ────────────────────────────────────
// Roles group permissions, but permissions can be assigned individually.
// This allows fine-grained access control beyond role boundaries.

export const PERMISSIONS = {
  // Members
  MEMBERS_READ: "members.read",
  MEMBERS_READ_YOUTH: "members.read:youth", // Youth members only
  MEMBERS_WRITE: "members.write",
  MEMBERS_DELETE: "members.delete",

  // Finance
  FINANCE_READ: "finance.read",
  FINANCE_WRITE: "finance.write",
  FINANCE_SEPA: "finance.sepa", // SEPA mandate management

  // Teams
  TEAMS_READ: "teams.read",
  TEAMS_WRITE: "teams.write",
  TEAMS_LINEUP: "teams.lineup", // Set board orders

  // Tournaments
  TOURNAMENTS_READ: "tournaments.read",
  TOURNAMENTS_WRITE: "tournaments.write",
  TOURNAMENTS_RESULTS: "tournaments.results", // Enter results

  // Games / PGN
  GAMES_READ: "games.read",
  GAMES_WRITE: "games.write",
  GAMES_IMPORT: "games.import", // PGN bulk import

  // Calendar
  EVENTS_READ: "events.read",
  EVENTS_WRITE: "events.write",

  // DWZ
  DWZ_READ: "dwz.read",
  DWZ_SYNC: "dwz.sync", // Trigger DWZ import/sync

  // Admin
  ADMIN_USERS: "admin.users",
  ADMIN_ROLES: "admin.roles",
  ADMIN_AUDIT: "admin.audit",
  ADMIN_SETTINGS: "admin.settings",

  // Parent access
  PARENT_DASHBOARD: "parent.dashboard", // View child's data
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Role → Permission Mapping ───────────────────────────────

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS), // All permissions

  vorstand: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_WRITE,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.DWZ_READ,
    PERMISSIONS.ADMIN_AUDIT,
  ],

  sportwart: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TEAMS_WRITE,
    PERMISSIONS.TEAMS_LINEUP,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.TOURNAMENTS_WRITE,
    PERMISSIONS.TOURNAMENTS_RESULTS,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.GAMES_WRITE,
    PERMISSIONS.GAMES_IMPORT,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.DWZ_READ,
    PERMISSIONS.DWZ_SYNC,
  ],

  jugendwart: [
    PERMISSIONS.MEMBERS_READ_YOUTH,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.DWZ_READ,
    PERMISSIONS.PARENT_DASHBOARD,
  ],

  kassenwart: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.FINANCE_SEPA,
  ],

  trainer: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.GAMES_WRITE,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.DWZ_READ,
  ],

  mitglied: [
    PERMISSIONS.MEMBERS_READ, // Limited view of other members
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.DWZ_READ,
  ],

  eltern: [
    PERMISSIONS.PARENT_DASHBOARD,
    PERMISSIONS.EVENTS_READ,
  ],
};

// ─── Helper Functions ─────────────────────────────────────────

export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  role: string,
  additionalPermissions: string[],
  permission: Permission,
): boolean {
  const rolePerms = new Set(getPermissionsForRole(role));
  const allPerms = new Set([...rolePerms, ...additionalPermissions]);
  return allPerms.has(permission);
}

export function hasAnyPermission(
  role: string,
  additionalPermissions: string[],
  permissions: Permission[],
): boolean {
  return permissions.some((p) =>
    hasPermission(role, additionalPermissions, p),
  );
}

export function hasAllPermissions(
  role: string,
  additionalPermissions: string[],
  permissions: Permission[],
): boolean {
  return permissions.every((p) =>
    hasPermission(role, additionalPermissions, p),
  );
}