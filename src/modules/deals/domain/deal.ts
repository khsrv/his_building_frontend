// ─── Deal domain types ────────────────────────────────────────────────────────

export type DealStatus = "draft" | "active" | "completed" | "cancelled";

export type DealPaymentType =
  | "full_payment"
  | "installment"
  | "mortgage"
  | "barter"
  | "combined";

export type ScheduleItemStatus =
  | "pending"
  | "upcoming"
  | "paid"
  | "partially_paid"
  | "overdue";

export interface Deal {
  readonly id: string;
  readonly dealNumber: string;
  readonly status: DealStatus;
  readonly paymentType: DealPaymentType;
  readonly totalAmount: number;
  readonly currency: string;
  readonly discountAmount: number;
  readonly downPayment: number;
  readonly installmentMonths: number | null;
  readonly remainingAmount: number;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientPhone: string;
  readonly unitId: string;
  readonly unitNumber: string;
  readonly propertyId: string;
  readonly propertyName: string;
  readonly managerName: string;
  readonly createdAt: string;
}

export interface ScheduleItem {
  readonly id: string;
  readonly dealId: string;
  readonly paymentNumber: number;
  readonly dueDate: string;
  readonly plannedAmount: number;
  readonly paidAmount: number;
  readonly remainingAmount: number;
  readonly status: ScheduleItemStatus;
  readonly paidAt: string | null;
}

export interface CreateDealInput {
  clientId: string;
  unitId: string;
  paymentType: DealPaymentType;
  totalAmount: number;
  currency: string;
  discountAmount?: number | undefined;
  discountReason?: string | undefined;
  downPayment?: number | undefined;
  installmentMonths?: number | undefined;
  installmentFrequency?: "monthly" | "quarterly" | "custom" | undefined;
  mortgageBank?: string | undefined;
  mortgageRate?: number | undefined;
  notes?: string | undefined;
}

export interface DealsListParams {
  status?: DealStatus;
  propertyId?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}

export interface ReceivePaymentInput {
  dealId: string;
  scheduleItemId?: string | undefined;
  amount: number;
  currency: string;
  paymentMethod: "cash" | "bank_transfer" | "mobile";
  accountId?: string | undefined;
  notes?: string | undefined;
}
