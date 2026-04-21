// Permission constants
export const PERMISSIONS = {
  // Admin permissions
  ADMIN_USERS: "admin.users",
  ADMIN_ROLES: "admin.roles",
  ADMIN_SETTINGS: "admin.settings",
  ADMIN_CLUBS: "admin.clubs",
  ADMIN_AUDIT: "admin.audit",
  
  // Member permissions
  MEMBERS_READ: "members.read",
  MEMBERS_WRITE: "members.write",
  MEMBERS_DELETE: "members.delete",
  MEMBERS_IMPORT: "members.import",
  MEMBERS_EXPORT: "members.export",
  
  // Tournament permissions
  TOURNAMENTS_READ: "tournaments.read",
  TOURNAMENTS_WRITE: "tournaments.write",
  TOURNAMENTS_DELETE: "tournaments.delete",
  TOURNAMENTS_MANAGE: "tournaments.manage",
  
  // Team permissions
  TEAMS_READ: "teams.read",
  TEAMS_WRITE: "teams.write",
  TEAMS_DELETE: "teams.delete",
  TEAMS_MANAGE: "teams.manage",
  
  // Event permissions
  EVENTS_READ: "events.read",
  EVENTS_WRITE: "events.write",
  EVENTS_DELETE: "events.delete",
  
  // Finance permissions
  FINANCE_READ: "finance.read",
  FINANCE_WRITE: "finance.write",
  FINANCE_MANAGE: "finance.manage",
  FINANCE_EXPORT: "finance.export",
  FINANCE_SEPA: "finance.sepa",
  
  // Page/CMS permissions
  PAGES_READ: "pages.read",
  PAGES_WRITE: "pages.write",
  PAGES_DELETE: "pages.delete",
  PAGES_PUBLISH: "pages.publish",
  
  // Audit permissions
  AUDIT_READ: "audit.read",
  
  // GDPR permissions
  GDPR_READ: "gdpr.read",
  GDPR_WRITE: "gdpr.write",
  GDPR_DELETE: "gdpr.delete",
  
  // DWZ permissions
  DWZ_SYNC: "dwz.sync",
  DWZ_READ: "dwz.read",
  
  // Game permissions
  GAMES_READ: "games.read",
  GAMES_WRITE: "games.write",
  GAMES_ANALYZE: "games.analyze",
  
  // Document permissions
  DOCUMENTS_READ: "documents.read",
  DOCUMENTS_WRITE: "documents.write",
  
  // Protocol permissions
  PROTOCOLS_READ: "protocols.read",
  PROTOCOLS_WRITE: "protocols.write",

  // Youth Protection permissions
  YOUTH_READ: "youth.read",           // Access to minor-specific data
  YOUTH_WRITE: "youth.write",         // Modify minor-specific data
  YOUTH_EMERGENCY: "youth.emergency", // Access to emergency contacts
  YOUTH_CONSENT: "youth.consent",     // Manage parental consents
} as const;

// Permission type
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role definitions with their base permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS), // Admin has all permissions
  
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
  ],
  
  sportwart: [
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
    PERMISSIONS.GAMES_READ,
    PERMISSIONS.DOCUMENTS_READ,
  ],
  
  eltern: [
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.TOURNAMENTS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.EVENTS_READ,
  ],
};

// Check if a user has a specific permission
export function hasPermission(
  role: string,
  userPermissions: string[],
  permission: Permission,
  isSuperAdmin = false
): boolean {
  // Super admin has all permissions
  if (isSuperAdmin) return true;
  
  // Check individual user permissions
  if (userPermissions.includes(permission)) return true;
  
  // Check role-based permissions
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
}

// Check if user has any of the specified permissions
export function hasAnyPermission(
  role: string,
  userPermissions: string[],
  permissions: Permission[],
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  
  return permissions.some(perm => hasPermission(role, userPermissions, perm, false));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(
  role: string,
  userPermissions: string[],
  permissions: Permission[],
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  
  return permissions.every(perm => hasPermission(role, userPermissions, perm, false));
}

// Get all permissions for a role
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Check if a role exists
export function isValidRole(role: string): boolean {
  return role in ROLE_PERMISSIONS;
}

// Get available roles
export function getAvailableRoles(): string[] {
  return Object.keys(ROLE_PERMISSIONS);
}

// Check if user has a specific role
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
