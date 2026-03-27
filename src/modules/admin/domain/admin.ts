import type { BackendRole } from "@/shared/types/api";

export type { BackendRole };

export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: BackendRole;
  readonly canLogin: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Tenant {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly isActive: boolean;
  readonly plan: string | null;
  readonly subscriptionExpiresAt: string | null;
  readonly trialEndsAt: string | null;
  readonly maxObjects: number; // 0 = unlimited
  readonly maxUsers: number;   // 0 = unlimited
  readonly phone: string | null;
  readonly email: string | null;
  readonly logoUrl: string | null;
  readonly primaryCurrency: string;
  readonly timezone: string;
  readonly createdAt: string;
}

export interface CompanySetting {
  readonly key: string;
  readonly value: string;
}

// Well-known setting keys
export type SettingKey = "booking_days" | "penalty_rate" | "max_discount" | "primary_currency";

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: BackendRole;
}

export interface UpdateUserRoleInput {
  role: BackendRole;
}

export interface ToggleCanLoginInput {
  canLogin: boolean;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
}

export interface UpdateTenantInput {
  name?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  primaryCurrency?: string | undefined;
  timezone?: string | undefined;
  locale?: string | undefined;
}

export interface CreateTenantUserInput {
  email: string;
  password: string;
  fullName: string;
  role: BackendRole;
}

export interface SetSubscriptionInput {
  plan: string;
  expiresAt: string;
  maxObjects: number; // 0 = unlimited
  maxUsers: number;   // 0 = unlimited
}

export interface SetSettingInput {
  key: string;
  value: string;
}

export interface UserListParams {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
}

export interface TenantListParams {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  isActive?: boolean | undefined;
}
