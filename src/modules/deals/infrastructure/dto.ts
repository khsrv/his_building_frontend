import type {
  BackendDealStatus,
  BackendPaymentType,
  BackendScheduleStatus,
  BackendInstallmentFrequency,
  BackendPaymentMethod,
} from "@/shared/types/api";

// ─── Deal DTOs ────────────────────────────────────────────────────────────────

export interface DealDto {
  id: string;
  deal_number: string;
  status: BackendDealStatus;
  payment_type: BackendPaymentType;
  total_amount: number;
  currency: string;
  discount_amount: number;
  down_payment: number;
  installment_months: number | null;
  remaining_amount: number;
  client_id: string;
  client_name: string;
  client_phone: string;
  unit_id: string;
  unit_number: string;
  property_id: string;
  property_name: string;
  manager_id: string;
  manager_name: string;
  created_at: string;
  updated_at: string;
}

export interface DealsListResponseDto {
  data: {
    items: DealDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface DealDetailResponseDto {
  data: DealDto;
}

// ─── Schedule DTOs ────────────────────────────────────────────────────────────

export interface ScheduleItemDto {
  id: string;
  deal_id: string;
  payment_number: number;
  due_date: string;
  planned_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: BackendScheduleStatus;
  paid_at: string | null;
}

export interface ScheduleResponseDto {
  data: {
    items: ScheduleItemDto[];
  };
}

// ─── Payment DTOs ─────────────────────────────────────────────────────────────

export interface PaymentDto {
  id: string;
  deal_id: string;
  schedule_item_id: string | null;
  amount: number;
  currency: string;
  payment_method: BackendPaymentMethod;
  status: "pending" | "confirmed" | "rejected";
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface PaymentsListResponseDto {
  data: {
    items: PaymentDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface PaymentDetailResponseDto {
  data: PaymentDto;
}

// ─── Create deal request ──────────────────────────────────────────────────────

export interface CreateDealRequestDto {
  client_id: string;
  unit_id: string;
  payment_type: BackendPaymentType;
  total_amount: number;
  currency: string;
  discount_amount?: number | undefined;
  discount_reason?: string | undefined;
  down_payment?: number | undefined;
  installment_months?: number | undefined;
  installment_frequency?: BackendInstallmentFrequency | undefined;
  mortgage_bank?: string | undefined;
  mortgage_rate?: number | undefined;
  notes?: string | undefined;
}

// ─── Receive payment request ──────────────────────────────────────────────────

export interface ReceivePaymentRequestDto {
  deal_id: string;
  schedule_item_id?: string | undefined;
  amount: number;
  currency: string;
  payment_method: BackendPaymentMethod;
  account_id?: string | undefined;
  notes?: string | undefined;
}

// ─── Client search DTOs ───────────────────────────────────────────────────────

export interface ClientSearchItemDto {
  id: string;
  full_name: string;
  phone: string;
}

export interface ClientSearchResponseDto {
  data: {
    items: ClientSearchItemDto[];
  };
}

// ─── Unit search DTOs ─────────────────────────────────────────────────────────

export interface UnitSearchItemDto {
  id: string;
  unit_number: string;
  property_id: string;
  property_name: string;
  rooms: number | null;
  total_area: number | null;
  base_price: number | null;
  status: string;
}

export interface UnitSearchResponseDto {
  data: {
    items: UnitSearchItemDto[];
  };
}

// ─── Property minimal DTO ─────────────────────────────────────────────────────

export interface PropertyMinimalDto {
  id: string;
  name: string;
}

export interface PropertiesListResponseDto {
  data: {
    items: PropertyMinimalDto[];
  };
}
