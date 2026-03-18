// ─── Backend API response wrappers ───────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: ApiPagination;
}

export interface ApiPaginatedResponse<T> {
  data: PaginatedData<T>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ─── Backend DTOs ─────────────────────────────────────────────────────────────

export type BackendRole =
  | "super_admin"
  | "company_admin"
  | "sales_head"
  | "manager"
  | "accountant"
  | "cashier"
  | "foreman"
  | "warehouse_manager"
  | "broker";

export interface UserDto {
  id: string;
  email: string;
  full_name: string;
  role: BackendRole;
  can_login: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokensDto {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  user: UserDto;
}

// ─── Backend enum values (as returned by API) ─────────────────────────────────
// IMPORTANT: These differ from domain/UI enums in some cases.
// Always map DTO → Domain in the infrastructure layer, never use DTOs in UI.

/** Unit status from backend. Note: backend uses "available", UI uses "free" */
export type BackendUnitStatus = "available" | "booked" | "reserved" | "sold";

/** Deal status lifecycle from backend */
export type BackendDealStatus = "draft" | "active" | "completed" | "cancelled";

/** Incoming payment status */
export type BackendPaymentStatus = "pending" | "confirmed" | "rejected";

/** Payment schedule item status */
export type BackendScheduleStatus = "pending" | "paid" | "partial" | "overdue";

/** Work order lifecycle */
export type BackendWorkOrderStatus = "draft" | "in_progress" | "completed" | "accepted";

/** Stock movement types */
export type BackendStockMovementType = "income" | "expense" | "write_off" | "return";

/** Payable reminder status */
export type BackendPayableReminderStatus = "pending" | "paid" | "cancelled";

/** Payee types for payable reminders */
export type BackendPayeeType = "supplier" | "contractor" | "master" | "other";

/** Account types for finance */
export type BackendAccountType = "cash" | "bank_account" | "card";

/** Payment method */
export type BackendPaymentMethod = "cash" | "bank_transfer" | "mobile";

/** Payment type (deal type) */
export type BackendPaymentType = "full_payment" | "installment" | "mortgage" | "barter" | "combined";

/** Installment frequency */
export type BackendInstallmentFrequency = "monthly" | "quarterly" | "custom";

// ─── Query params helpers ─────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface SearchParams {
  search?: string;
}

// ─── Mapper helper types ──────────────────────────────────────────────────────

/** Map backend unit status to UI/domain status */
export function mapUnitStatus(backendStatus: BackendUnitStatus): "free" | "booked" | "reserved" | "sold" {
  if (backendStatus === "available") return "free";
  return backendStatus;
}

/** Map UI/domain unit status to backend status */
export function toBackendUnitStatus(uiStatus: "free" | "booked" | "reserved" | "sold"): BackendUnitStatus {
  if (uiStatus === "free") return "available";
  return uiStatus;
}
