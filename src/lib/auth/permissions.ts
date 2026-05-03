// Permission constants
export const PERMISSIONS = {
  ADMIN_USERS: "admin.users",
  ADMIN_ROLES: "admin.roles",
  ADMIN_SETTINGS: "admin.settings",
  ADMIN_CLUBS: "admin.clubs",
  ADMIN_AUDIT: "admin.audit",

  MEMBERS_READ: "members.read",
  MEMBERS_WRITE: "members.write",
  MEMBERS_DELETE: "members.delete",
  MEMBERS_IMPORT: "members.import",
  MEMBERS_EXPORT: "members.export",

  TOURNAMENTS_READ: "tournaments.read",
  TOURNAMENTS_WRITE: "tournaments.write",
  TOURNAMENTS_DELETE: "tournaments.delete",
  TOURNAMENTS_MANAGE: "tournaments.manage",

  TEAMS_READ: "teams.read",
  TEAMS_WRITE: "teams.write",
  TEAMS_DELETE: "teams.delete",
  TEAMS_MANAGE: "teams.manage",

  EVENTS_READ: "events.read",
  EVENTS_WRITE: "events.write",
  EVENTS_DELETE: "events.delete",

  FINANCE_READ: "finance.read",
  FINANCE_WRITE: "finance.write",
  FINANCE_MANAGE: "finance.manage",
  FINANCE_EXPORT: "finance.export",
  FINANCE_SEPA: "finance.sepa",

  PAGES_READ: "pages.read",
  PAGES_WRITE: "pages.write",
  PAGES_DELETE: "pages.delete",
  PAGES_PUBLISH: "pages.publish",

  AUDIT_READ: "audit.read",

  GDPR_READ: "gdpr.read",
  GDPR_WRITE: "gdpr.write",
  GDPR_DELETE: "gdpr.delete",

  DWZ_SYNC: "dwz.sync",
  DWZ_READ: "dwz.read",

  GAMES_READ: "games.read",
  GAMES_WRITE: "games.write",
  GAMES_ANALYZE: "games.analyze",

  DOCUMENTS_READ: "documents.read",
  DOCUMENTS_WRITE: "documents.write",

  PROTOCOLS_READ: "protocols.read",
  PROTOCOLS_WRITE: "protocols.write",

  YOUTH_READ: "youth.read",
  YOUTH_WRITE: "youth.write",
  YOUTH_EMERGENCY: "youth.emergency",
  YOUTH_CONSENT: "youth.consent",

  CLUB_SETTINGS: "club.settings",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS),

  vorstand: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_WRITE,
    PERMISSIONS.MEMBERS_IMPORT,
    PERMISSIONS.MEMBERS_EXPORT,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.TOURNAMENTS_WRITE,
    PERMISSIONS.TOURNAMENTS_MANAGE,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TEAMS_WRITE,
    PERMISSIONS.TEAMS_MANAGE,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.FINANCE_EXPORT,
    PERMISSIONS.FINANCE_SEPA,
    PERMISSIONS.PAGES_READ,
    PERMISSIONS.PAGES_WRITE,
    PERMISSIONS.PAGES_PUBLISH,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.GDPR_READ,
    PERMISSIONS.GDPR_WRITE,
    PERMISSIONS.DWZ_SYNC,
    PERMISSIONS.DWZ_READ,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.GAMES_WRITE,
    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_WRITE,
    PERMISSIONS.PROTOCOLS_READ,
    PERMISSIONS.PROTOCOLS_WRITE,
    PERMISSIONS.YOUTH_READ,
    PERMISSIONS.YOUTH_WRITE,
    PERMISSIONS.YOUTH_EMERGENCY,
    PERMISSIONS.YOUTH_CONSENT,
    PERMISSIONS.CLUB_SETTINGS,
  ],

  spielleiter: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.TOURNAMENTS_WRITE,
    PERMISSIONS.TOURNAMENTS_MANAGE,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TEAMS_WRITE,
    PERMISSIONS.TEAMS_MANAGE,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.DWZ_READ,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.GAMES_WRITE,
    PERMISSIONS.GAMES_ANALYZE,
  ],

  jugendwart: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_WRITE,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.DWZ_READ,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.YOUTH_READ,
    PERMISSIONS.YOUTH_WRITE,
    PERMISSIONS.YOUTH_EMERGENCY,
    PERMISSIONS.YOUTH_CONSENT,
  ],

  kassenwart: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_EXPORT,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.FINANCE_EXPORT,
    PERMISSIONS.AUDIT_READ,
  ],

  trainer: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.GAMES_ANALYZE,
  ],

  mitglied: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.PAGES_READ,
    PERMISSIONS.DOCUMENTS_READ,
  ],

  eltern: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
  ],

  user: [],
};

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  vorstand: "Vorstand",
  spielleiter: "Spielleiter",
  jugendwart: "Jugendwart",
  kassenwart: "Kassenwart",
  trainer: "Trainer",
  mitglied: "Mitglied",
  eltern: "Eltern",
  user: "Benutzer",
};

export const ROLES = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function hasPermission(
  role: string,
  userPermissions: string[],
  permission: Permission,
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  if (userPermissions.includes(permission)) return true;
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
}

export function hasAnyPermission(
  role: string,
  userPermissions: string[],
  permissions: Permission[],
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  return permissions.some((perm) =>
    hasPermission(role, userPermissions, perm, false)
  );
}

export function hasAllPermissions(
  role: string,
  userPermissions: string[],
  permissions: Permission[],
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  return permissions.every((perm) =>
    hasPermission(role, userPermissions, perm, false)
  );
}

export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function isValidRole(role: string): boolean {
  return role in ROLE_PERMISSIONS;
}

export function getAvailableRoles(): string[] {
  return Object.keys(ROLE_PERMISSIONS);
}

export function hasRole(
  userRole: string,
  requiredRole: string | string[],
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}
