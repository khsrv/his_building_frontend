import type { UserRole, PermissionCode } from "@/shared/types/permissions";

export type { UserRole };

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly avatarUrl: string | null;
  readonly roles: readonly UserRole[];
  readonly permissions: readonly PermissionCode[];
  readonly tenantId: string;
  readonly tenantName: string;
  readonly tenantSlug: string;
}

export interface Session {
  readonly user: SessionUser;
  readonly expiresAtIso: string;
}
