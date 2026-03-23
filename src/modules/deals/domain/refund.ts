export type RefundStatus = "pending" | "refunded" | "not_required";

export interface DealCancellationRecord {
  readonly id: string;
  readonly dealId: string;
  readonly dealNumber: string;
  readonly clientName: string;
  readonly clientPhone: string;
  readonly reason: string;
  readonly refundType: "full" | "partial" | "none";
  readonly paidAmount: number;
  readonly refundAmount: number;
  readonly penaltyAmount: number;
  readonly penaltyReason: string;
  readonly currency: string;
  readonly refundStatus: RefundStatus;
  readonly refundedAt: string | null;
  readonly cancelledBy: string;
  readonly createdAt: string;
}

export interface MarkRefundedInput {
  accountId: string;
  paymentMethod: "cash" | "bank_transfer" | "mobile";
  notes?: string | undefined;
}
