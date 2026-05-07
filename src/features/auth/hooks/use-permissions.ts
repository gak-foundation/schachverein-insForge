"use client";

import { authClient } from "@/lib/auth/client";
import { 
  PERMISSIONS, 
  Permission, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  hasRole
} from "@/lib/auth/permissions";

export function usePermissions() {
  const { data: session, isPending } = authClient.useSession();

  const userRole = (session?.user as any)?.role ?? "mitglied";
  const userPermissions = (session?.user as any)?.permissions ?? [];

  return {
    isPending,
    hasPermission: (permission: Permission) => 
      hasPermission(userRole, userPermissions, permission),
    hasAnyPermission: (permissions: Permission[]) => 
      hasAnyPermission(userRole, userPermissions, permissions),
    hasAllPermissions: (permissions: Permission[]) => 
      hasAllPermissions(userRole, userPermissions, permissions),
    hasRole: (role: string | string[]) => 
      hasRole(userRole, role),
    role: userRole,
    permissions: userPermissions,
    PERMISSIONS,
  };
}
