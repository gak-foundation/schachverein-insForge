"use client";

import { ReactNode } from "react";
import { Permission } from "@/lib/auth/permissions";
import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  anyPermission?: Permission[];
  allPermissions?: Permission[];
  role?: string | string[];
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  anyPermission,
  allPermissions,
  role,
  fallback = null,
}: PermissionGateProps) {
  const { 
    hasPermission: checkPermission, 
    hasAnyPermission: checkAny, 
    hasAllPermissions: checkAll,
    hasRole: checkRole,
    isPending 
  } = usePermissions();

  if (isPending) return null;

  let hasAccess = true;

  if (permission && !checkPermission(permission)) {
    hasAccess = false;
  }

  if (anyPermission && !checkAny(anyPermission)) {
    hasAccess = false;
  }

  if (allPermissions && !checkAll(allPermissions)) {
    hasAccess = false;
  }

  if (role && !checkRole(role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
