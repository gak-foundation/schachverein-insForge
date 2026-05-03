import { describe, it, expect } from "vitest";
import {
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  isValidRole,
  getAvailableRoles,
  hasRole,
  type Permission,
} from "./permissions";

describe("hasPermission", () => {
  it("sollte Super-Admin immer erlauben", () => {
    expect(hasPermission("mitglied", [], PERMISSIONS.ADMIN_USERS, true)).toBe(true);
    expect(hasPermission("user", [], PERMISSIONS.FINANCE_MANAGE, true)).toBe(true);
  });

  it("sollte benutzerdefinierte Berechtigungen prüfen", () => {
    expect(hasPermission("mitglied", [PERMISSIONS.FINANCE_WRITE], PERMISSIONS.FINANCE_WRITE)).toBe(true);
    expect(hasPermission("mitglied", [], PERMISSIONS.FINANCE_WRITE)).toBe(false);
  });

  it("sollte rollenbasierte Berechtigungen prüfen", () => {
    expect(hasPermission("admin", [], PERMISSIONS.ADMIN_USERS)).toBe(true);
    expect(hasPermission("vorstand", [], PERMISSIONS.FINANCE_WRITE)).toBe(true);
    expect(hasPermission("mitglied", [], PERMISSIONS.FINANCE_WRITE)).toBe(false);
    expect(hasPermission("user", [], PERMISSIONS.MEMBERS_READ)).toBe(false);
  });

  it("sollte alle Rollen korrekt abbilden", () => {
    expect(hasPermission("sportwart", [], PERMISSIONS.TOURNAMENTS_MANAGE)).toBe(true);
    expect(hasPermission("sportwart", [], PERMISSIONS.FINANCE_READ)).toBe(false);
    expect(hasPermission("kassenwart", [], PERMISSIONS.FINANCE_MANAGE)).toBe(true);
    expect(hasPermission("kassenwart", [], PERMISSIONS.TOURNAMENTS_WRITE)).toBe(false);
    expect(hasPermission("jugendwart", [], PERMISSIONS.YOUTH_CONSENT)).toBe(true);
    expect(hasPermission("jugendwart", [], PERMISSIONS.FINANCE_WRITE)).toBe(false);
    expect(hasPermission("trainer", [], PERMISSIONS.GAMES_ANALYZE)).toBe(true);
    expect(hasPermission("trainer", [], PERMISSIONS.ADMIN_SETTINGS)).toBe(false);
    expect(hasPermission("eltern", [], PERMISSIONS.MEMBERS_READ)).toBe(true);
    expect(hasPermission("eltern", [], PERMISSIONS.MEMBERS_WRITE)).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("sollte true zurückgeben wenn mindestens eine Berechtigung vorhanden", () => {
    const perms: Permission[] = [PERMISSIONS.FINANCE_READ, PERMISSIONS.ADMIN_USERS];
    expect(hasAnyPermission("mitglied", [PERMISSIONS.FINANCE_READ], perms)).toBe(true);
  });

  it("sollte false zurückgeben wenn keine Berechtigung vorhanden", () => {
    const perms: Permission[] = [PERMISSIONS.ADMIN_USERS, PERMISSIONS.FINANCE_MANAGE];
    expect(hasAnyPermission("mitglied", [], perms)).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("sollte true nur wenn alle Berechtigungen vorhanden", () => {
    const perms: Permission[] = [PERMISSIONS.MEMBERS_READ, PERMISSIONS.EVENTS_READ];
    expect(hasAllPermissions("mitglied", [], perms)).toBe(true);
  });

  it("sollte false wenn eine fehlt", () => {
    const perms: Permission[] = [PERMISSIONS.MEMBERS_READ, PERMISSIONS.MEMBERS_WRITE];
    expect(hasAllPermissions("mitglied", [], perms)).toBe(false);
  });
});

describe("getPermissionsForRole", () => {
  it("sollte alle Berechtigungen für eine Rolle zurückgeben", () => {
    const perms = getPermissionsForRole("admin");
    expect(perms.length).toBeGreaterThan(10);
    expect(perms).toContain(PERMISSIONS.ADMIN_USERS);
    expect(perms).toContain(PERMISSIONS.FINANCE_MANAGE);
  });

  it("sollte leeres Array für unbekannte Rollen zurückgeben", () => {
    expect(getPermissionsForRole("unknown_role")).toEqual([]);
  });
});

describe("isValidRole", () => {
  it("sollte gültige Rollen erkennen", () => {
    expect(isValidRole("admin")).toBe(true);
    expect(isValidRole("vorstand")).toBe(true);
    expect(isValidRole("mitglied")).toBe(true);
  });

  it("sollte ungültige Rollen ablehnen", () => {
    expect(isValidRole("superadmin")).toBe(false);
    expect(isValidRole("")).toBe(false);
  });
});

describe("getAvailableRoles", () => {
  it("sollte alle verfügbaren Rollen zurückgeben", () => {
    const roles = getAvailableRoles();
    expect(roles).toContain("admin");
    expect(roles).toContain("vorstand");
    expect(roles).toContain("mitglied");
    expect(roles).toContain("user");
  });
});

describe("hasRole", () => {
  it("sollte Super-Admin immer erlauben", () => {
    expect(hasRole("mitglied", "admin", true)).toBe(true);
  });

  it("sollte einzelne Rolle prüfen", () => {
    expect(hasRole("admin", "admin")).toBe(true);
    expect(hasRole("mitglied", "admin")).toBe(false);
  });

  it("sollte mehrere Rollen prüfen", () => {
    expect(hasRole("vorstand", ["admin", "vorstand"])).toBe(true);
    expect(hasRole("mitglied", ["admin", "vorstand"])).toBe(false);
  });
});
