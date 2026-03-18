/**
 * Shared entity interfaces used across modules.
 * These are DOMAIN-level types — no DTOs, no transport concerns.
 * Module-specific detailed entities live in their own domain/ folders.
 */

import type {
  BuildingStatus,
  CurrencyCode,
  DealSource,
  DealStage,
  LandDealType,
  LandStatus,
  PaymentStatus,
  PaymentType,
  UnitStatus,
  UnitType,
} from "@/shared/types/enums";

// ─── Common ───────────────────────────────────────────────────────────────────

/** Lightweight reference to any entity (for selects, lookups, badges) */
export interface EntityRef {
  readonly id: string;
  readonly label: string;
}

/** Paginated response shape from API */
export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

/** Pagination request params */
export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

/** Sort params */
export interface SortParams {
  readonly sortBy: string;
  readonly sortOrder: "asc" | "desc";
}

/** Audit fields present on most entities */
export interface Auditable {
  readonly createdAt: string; // ISO date
  readonly updatedAt: string;
  readonly createdBy: string; // user id
}

// ─── Tenant ───────────────────────────────────────────────────────────────────

export interface Tenant {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly logoUrl: string | null;
  readonly baseCurrency: CurrencyCode;
  readonly timezone: string;
  readonly locale: string;
  readonly plan: "starter" | "business" | "enterprise";
  readonly isActive: boolean;
}

// ─── Building (ЖК) ───────────────────────────────────────────────────────────

export interface Building {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly address: string;
  readonly status: BuildingStatus;
  readonly totalUnits: number;
  readonly soldUnits: number;
  readonly realizationPercent: number;
  readonly imageUrl: string | null;
  readonly currency: CurrencyCode;
  readonly constructionStartDate: string | null;
  readonly constructionEndDate: string | null;
}

// ─── Unit (Квартира) ──────────────────────────────────────────────────────────

export interface Unit {
  readonly id: string;
  readonly buildingId: string;
  readonly blockName: string;
  readonly floor: number;
  readonly number: string;
  readonly type: UnitType;
  readonly rooms: number;
  readonly areaSqm: number;
  readonly pricePerSqm: number;
  readonly totalPrice: number;
  readonly status: UnitStatus;
  readonly currency: CurrencyCode;
}

// ─── Client (Покупатель) ──────────────────────────────────────────────────────

export interface Client {
  readonly id: string;
  readonly tenantId: string;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string | null;
  readonly passportNumber: string | null;
  readonly source: DealSource;
  readonly managerId: string | null;
  readonly managerName: string | null;
  readonly tags: readonly string[];
  readonly createdAt: string;
}

// ─── Deal (Сделка) ────────────────────────────────────────────────────────────

export interface Deal {
  readonly id: string;
  readonly tenantId: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly unitId: string;
  readonly unitLabel: string;
  readonly buildingName: string;
  readonly stage: DealStage;
  readonly paymentType: PaymentType;
  readonly totalAmount: number;
  readonly paidAmount: number;
  readonly currency: CurrencyCode;
  readonly managerId: string;
  readonly managerName: string;
  readonly contractNumber: string | null;
  readonly bookingExpiresAt: string | null;
  readonly createdAt: string;
}

// ─── Payment (Платёж) ─────────────────────────────────────────────────────────

export interface Payment {
  readonly id: string;
  readonly dealId: string;
  readonly tenantId: string;
  readonly amount: number;
  readonly currency: CurrencyCode;
  readonly status: PaymentStatus;
  readonly dueDate: string;
  readonly paidDate: string | null;
  readonly label: string | null;
  readonly receiptNumber: string | null;
}

// ─── Land (Земельный участок) ─────────────────────────────────────────────────

export interface LandParcel {
  readonly id: string;
  readonly tenantId: string;
  readonly address: string;
  readonly cadastralNumber: string;
  readonly areaSqm: number;
  readonly status: LandStatus;
  readonly dealType: LandDealType;
  readonly sellerName: string;
  readonly totalCost: number;
  readonly currency: CurrencyCode;
}

// ─── Finance (Финансовая запись) ───────────────────────────────────────────────

export interface FinanceEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly date: string;
  readonly type: "income" | "expense" | "transfer";
  readonly category: string;
  readonly amount: number;
  readonly currency: CurrencyCode;
  readonly accountId: string;
  readonly accountName: string;
  readonly description: string;
  readonly relatedDealId: string | null;
  readonly createdBy: string;
}

export interface FinanceAccount {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly type: "bank" | "cash";
  readonly currency: CurrencyCode;
  readonly balance: number;
  readonly isActive: boolean;
}

// ─── Exchange Rate ────────────────────────────────────────────────────────────

export interface ExchangeRate {
  readonly id: string;
  readonly tenantId: string;
  readonly date: string;
  readonly fromCurrency: CurrencyCode;
  readonly toCurrency: CurrencyCode;
  readonly rate: number;
}
