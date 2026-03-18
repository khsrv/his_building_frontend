export interface PaymentsItem {
  id: string;
  title: string;
  createdAtIso: string;
}

// ─── Upcoming Payment (schedule) ─────────────────────────────────────────────

export type SchedulePaymentStatus =
  | "pending"
  | "upcoming"
  | "paid"
  | "partially_paid"
  | "overdue";

export interface UpcomingPayment {
  readonly id: string;
  readonly dueDate: string;
  readonly clientName: string;
  readonly clientPhone: string;
  readonly unitNumber: string;
  readonly propertyName: string;
  readonly dealId: string;
  readonly dealNumber: string;
  readonly plannedAmount: number;
  readonly paidAmount: number;
  readonly remainingAmount: number;
  readonly status: SchedulePaymentStatus;
  readonly currency: string;
}

// ─── Overdue Payment ─────────────────────────────────────────────────────────

export interface OverduePayment {
  readonly id: string;
  readonly dueDate: string;
  readonly daysOverdue: number;
  readonly clientName: string;
  readonly clientPhone: string;
  readonly unitNumber: string;
  readonly propertyName: string;
  readonly dealId: string;
  readonly dealNumber: string;
  readonly plannedAmount: number;
  readonly paidAmount: number;
  readonly remainingAmount: number;
  readonly currency: string;
}

// ─── Property (for filter) ───────────────────────────────────────────────────

export interface PropertyOption {
  readonly id: string;
  readonly name: string;
}
