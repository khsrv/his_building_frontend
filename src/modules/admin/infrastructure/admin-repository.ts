import { apiClient } from "@/shared/lib/http/api-client";
import {
  getResponseData,
  getResponseItems,
  getResponsePagination,
  getResponseRecord,
  getResponseStringMap,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
import type { ApiResponse, ApiPaginatedResponse } from "@/shared/types/api";
import type {
  AdminUser,
  Tenant,
  CompanySetting,
  CreateUserInput,
  UpdateUserRoleInput,
  ToggleCanLoginInput,
  CreateTenantInput,
  CreateTenantUserInput,
  UpdateTenantInput,
  SetSubscriptionInput,
  SetSettingInput,
  UserListParams,
  TenantListParams,
} from "@/modules/admin/domain/admin";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface UserDto {
  id: string;
  email: string;
  full_name: string;
  role: string;
  can_login: boolean;
  created_at: string;
  updated_at: string;
}

interface TenantDto {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  trial_ends_at: string | null;
  max_objects: number;
  max_users: number;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  primary_currency: string;
  timezone: string;
  created_at: string;
}

interface SettingDto {
  key: string;
  value: string;
}

interface StatusResponseDto {
  status: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

import type { BackendRole } from "@/shared/types/api";

function isBackendRole(value: string): value is BackendRole {
  return [
    "super_admin",
    "company_admin",
    "sales_head",
    "manager",
    "accountant",
    "cashier",
    "foreman",
    "warehouse_manager",
    "broker",
  ].includes(value);
}

function mapUserDto(dto: UserDto): AdminUser {
  return {
    id: dto.id,
    email: dto.email,
    fullName: dto.full_name,
    role: isBackendRole(dto.role) ? dto.role : "manager",
    canLogin: dto.can_login,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapTenantDto(dto: TenantDto): Tenant {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    isActive: dto.is_active,
    plan: dto.subscription_plan,
    subscriptionExpiresAt: dto.subscription_expires_at ?? null,
    trialEndsAt: dto.trial_ends_at ?? null,
    maxObjects: dto.max_objects ?? 0,
    maxUsers: dto.max_users ?? 0,
    phone: dto.phone,
    email: dto.email,
    logoUrl: dto.logo_url,
    primaryCurrency: dto.primary_currency,
    timezone: dto.timezone,
    createdAt: dto.created_at,
  };
}

function mapSettingDto(dto: SettingDto): CompanySetting {
  return {
    key: dto.key,
    value: dto.value,
  };
}

// ─── Paginated result ─────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(
  params?: UserListParams,
): Promise<PaginatedResult<AdminUser>> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.search) query["search"] = params.search;

  const res = await apiClient.get<ApiPaginatedResponse<UserDto>>(
    "/api/v1/admin/users",
    query,
  );
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<UserDto>(normalized);
  const pagination = getResponsePagination(normalized);
  return {
    items: items.filter((item) => Boolean(item?.id)).map(mapUserDto),
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params?.page ?? 1),
    limit: pagination?.limit ?? (params?.limit ?? 20),
  };
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const body: Record<string, unknown> = {
    email: input.email,
    password: input.password,
    full_name: input.fullName,
    role: input.role,
  };
  const res = await apiClient.post<{ data: UserDto }>("/api/v1/admin/users", body);
  return mapUserDto(getResponseData<UserDto>(normalizeApiKeys(res)));
}

export async function getUserById(id: string): Promise<AdminUser> {
  const res = await apiClient.get<ApiResponse<UserDto>>(`/api/v1/admin/users/${id}`);
  return mapUserDto(getResponseData<UserDto>(normalizeApiKeys(res)));
}

export async function updateUserRole(
  id: string,
  input: UpdateUserRoleInput,
): Promise<{ status: string }> {
  const res = await apiClient.patch<StatusResponseDto>(
    `/api/v1/admin/users/${id}/role`,
    { role: input.role },
  );
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
}

export async function toggleCanLogin(
  id: string,
  input: ToggleCanLoginInput,
): Promise<{ status: string }> {
  const res = await apiClient.patch<StatusResponseDto>(
    `/api/v1/admin/users/${id}/can-login`,
    { can_login: input.canLogin },
  );
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
}

export async function deleteUser(id: string): Promise<{ status: string }> {
  const res = await apiClient.delete<StatusResponseDto>(`/api/v1/admin/users/${id}`);
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
}

export async function resetUserPassword(
  id: string,
  password: string,
): Promise<{ status: string }> {
  const res = await apiClient.patch<StatusResponseDto>(
    `/api/v1/admin/users/${id}/reset-password`,
    { password },
  );
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
}

export async function getUserPropertyAccess(id: string): Promise<string[]> {
  const res = await apiClient.get<{ data: { property_ids: string[] } }>(
    `/api/v1/admin/users/${id}/property-access`,
  );
  const normalized = normalizeApiKeys(res);
  const record = getResponseRecord(normalized);
  const ids = record?.["property_ids"];
  return Array.isArray(ids) ? (ids as string[]) : [];
}

export async function setUserPropertyAccess(
  id: string,
  propertyIds: string[],
): Promise<string[]> {
  const res = await apiClient.put<{ data: { property_ids: string[] } }>(
    `/api/v1/admin/users/${id}/property-access`,
    { property_ids: propertyIds },
  );
  const normalized = normalizeApiKeys(res);
  const record = getResponseRecord(normalized);
  const ids = record?.["property_ids"];
  return Array.isArray(ids) ? (ids as string[]) : [];
}

// ─── Tenants ──────────────────────────────────────────────────────────────────

export async function listTenants(
  params?: TenantListParams,
): Promise<PaginatedResult<Tenant>> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.search) query["search"] = params.search;
  if (params?.isActive !== undefined) query["is_active"] = params.isActive;

  const res = await apiClient.get<ApiPaginatedResponse<TenantDto>>(
    "/api/v1/super-admin/tenants",
    query,
  );
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<TenantDto>(normalized);
  const pagination = getResponsePagination(normalized);
  return {
    items: items.filter((item) => Boolean(item?.id)).map(mapTenantDto),
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params?.page ?? 1),
    limit: pagination?.limit ?? (params?.limit ?? 20),
  };
}

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const body: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
  };
  const res = await apiClient.post<{ data: TenantDto }>(
    "/api/v1/super-admin/tenants",
    body,
  );
  return mapTenantDto(getResponseData<TenantDto>(normalizeApiKeys(res)));
}

export async function getTenantById(id: string): Promise<Tenant> {
  const res = await apiClient.get<ApiResponse<TenantDto>>(
    `/api/v1/super-admin/tenants/${id}`,
  );
  return mapTenantDto(getResponseData<TenantDto>(normalizeApiKeys(res)));
}

export async function updateTenant(
  id: string,
  input: UpdateTenantInput,
): Promise<Tenant> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.phone !== undefined) body["phone"] = input.phone;
  if (input.email !== undefined) body["email"] = input.email;
  if (input.address !== undefined) body["address"] = input.address;
  if (input.primaryCurrency !== undefined) body["primary_currency"] = input.primaryCurrency;
  if (input.timezone !== undefined) body["timezone"] = input.timezone;
  if (input.locale !== undefined) body["locale"] = input.locale;

  const res = await apiClient.patch<{ data: TenantDto }>(
    `/api/v1/super-admin/tenants/${id}`,
    body,
  );
  return mapTenantDto(getResponseData<TenantDto>(normalizeApiKeys(res)));
}

export async function activateTenant(id: string): Promise<{ status: string }> {
  const res = await apiClient.post<StatusResponseDto>(
    `/api/v1/super-admin/tenants/${id}/activate`,
    {},
  );
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
}

export async function deactivateTenant(id: string): Promise<{ status: string }> {
  const res = await apiClient.post<StatusResponseDto>(
    `/api/v1/super-admin/tenants/${id}/deactivate`,
    {},
  );
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
}

export async function setSubscription(
  id: string,
  input: SetSubscriptionInput,
): Promise<Tenant> {
  const body: Record<string, unknown> = {
    plan: input.plan,
    expires_at: input.expiresAt,
    max_objects: input.maxObjects,
    max_users: input.maxUsers,
  };
  const res = await apiClient.post<{ data: TenantDto }>(
    `/api/v1/super-admin/tenants/${id}/subscription`,
    body,
  );
  return mapTenantDto(getResponseData<TenantDto>(normalizeApiKeys(res)));
}

// ─── Tenant Users (super-admin) ──────────────────────────────────────────────

export async function createTenantUser(
  tenantId: string,
  input: CreateTenantUserInput,
): Promise<AdminUser> {
  const body: Record<string, unknown> = {
    email: input.email,
    password: input.password,
    full_name: input.fullName,
    role: input.role,
  };
  const res = await apiClient.post<{ data: UserDto }>(
    `/api/v1/super-admin/tenants/${tenantId}/users`,
    body,
  );
  return mapUserDto(getResponseData<UserDto>(normalizeApiKeys(res)));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function listSettings(): Promise<CompanySetting[]> {
  const res = await apiClient.get<{ data: SettingDto[] | { items: SettingDto[]; pagination?: unknown } | Record<string, string> }>("/api/v1/settings");
  const normalized = normalizeApiKeys(res);
  const items = getResponseItems<SettingDto>(normalized);
  if (items.length > 0) {
    return items.filter((item) => Boolean(item?.key)).map(mapSettingDto);
  }

  const settingMap = getResponseStringMap(normalized);
  return Object.entries(settingMap).map(([key, value]) => ({ key, value }));
}

export async function setSetting(
  input: SetSettingInput,
): Promise<{ status: string }> {
  const res = await apiClient.post<StatusResponseDto>("/api/v1/settings", {
    key: input.key,
    value: input.value,
  });
  const data = getResponseRecord(normalizeApiKeys(res));
  return { status: String(data?.status ?? "ok") };
}
