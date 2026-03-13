"use client";

import type { ReactNode } from "react";
import { canAccess, type PermissionCode } from "@/shared/lib/auth/rbac";

interface PermissionGateProps {
  userPermissions: readonly PermissionCode[];
  requiredPermissions: readonly PermissionCode[];
  match?: "any" | "all";
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  userPermissions,
  requiredPermissions,
  match = "all",
  fallback = null,
  children,
}: PermissionGateProps) {
  if (!canAccess(userPermissions, requiredPermissions, match)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
