// #17 fix: use the strict union type from permissions.ts, not the loose `string`
import type { PermissionCode } from "@/shared/types/permissions";

export type { PermissionCode } from "@/shared/types/permissions";

export function hasAnyPermission(
  userPermissions: readonly PermissionCode[],
  requiredPermissions: readonly PermissionCode[],
) {
  if (requiredPermissions.length === 0) {
    return true;
  }

  const userSet = new Set(userPermissions);
  return requiredPermissions.some((permission) => userSet.has(permission));
}

export function hasAllPermissions(
  userPermissions: readonly PermissionCode[],
  requiredPermissions: readonly PermissionCode[],
) {
  if (requiredPermissions.length === 0) {
    return true;
  }

  const userSet = new Set(userPermissions);
  return requiredPermissions.every((permission) => userSet.has(permission));
}

export function canAccess(
  userPermissions: readonly PermissionCode[],
  requiredPermissions: readonly PermissionCode[],
  match: "any" | "all" = "all",
) {
  return match === "any"
    ? hasAnyPermission(userPermissions, requiredPermissions)
    : hasAllPermissions(userPermissions, requiredPermissions);
}
