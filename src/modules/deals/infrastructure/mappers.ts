import type { Deal, DealCancellation, RefundType, RefundStatus, ScheduleItem } from "@/modules/deals/domain/deal";
import type { DealDto, DealCancellationDto, ScheduleItemDto } from "@/modules/deals/infrastructure/dto";

const VALID_REFUND_TYPES: readonly string[] = ["full", "partial", "none"];
const VALID_REFUND_STATUSES: readonly string[] = ["pending", "refunded", "not_required"];

// #10 fix: safe numeric conversion — guards against NaN/Infinity from backend
function safeNumber(val: unknown, fallback = 0): number {
  const n = Number(val ?? fallback);
  if (!isFinite(n)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[mappers] Invalid numeric value from backend:", val);
    }
    return fallback;
  }
  return n;
}

function mapCancellationDto(dto: DealCancellationDto): DealCancellation {
  // #18 fix: warn on invalid enum values instead of silently defaulting
  const refundType = VALID_REFUND_TYPES.includes(dto.refund_type)
    ? (dto.refund_type as RefundType)
    : (() => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[mappers] Unknown refund_type from backend:", dto.refund_type, "— defaulting to 'none'");
        }
        return "none" as RefundType;
      })();

  const refundStatus = VALID_REFUND_STATUSES.includes(dto.refund_status)
    ? (dto.refund_status as RefundStatus)
    : (() => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[mappers] Unknown refund_status from backend:", dto.refund_status, "— defaulting to 'not_required'");
        }
        return "not_required" as RefundStatus;
      })();

  return {
    reason: dto.reason ?? "",
    refundType,
    paidAmount: safeNumber(dto.paid_amount),
    refundAmount: safeNumber(dto.refund_amount),
    penaltyAmount: safeNumber(dto.penalty_amount),
    penaltyReason: dto.penalty_reason ?? "",
    refundStatus,
    refundedAt: dto.refunded_at ?? null,
  };
}

export function mapDealDtoToDomain(dto: DealDto): Deal {
  return {
    id: dto.id,
    dealNumber: dto.deal_number ?? "",
    status: dto.status,
    paymentType: dto.payment_type,
    totalAmount: safeNumber(dto.total_amount),
    currency: dto.currency ?? "USD",
    discountAmount: safeNumber(dto.discount_amount),
    surchargeAmount: safeNumber(dto.surcharge_amount),
    finalAmount: safeNumber(dto.final_amount),
    downPayment: safeNumber(dto.down_payment),
    installmentMonths: dto.installment_months ?? null,
    clientId: dto.client_id ?? "",
    clientName: dto.client_name ?? "",
    clientPhone: dto.client_phone ?? "",
    unitId: dto.unit_id ?? "",
    unitNumber: dto.unit_number ?? "",
    propertyId: dto.property_id ?? "",
    propertyName: dto.property_name ?? "",
    managerId: dto.manager_id ?? "",
    managerName: dto.manager_name ?? "",
    contractNumber: dto.contract_number ?? "",
    notes: dto.notes ?? "",
    signedAt: dto.signed_at,
    completedAt: dto.completed_at,
    cancelledAt: dto.cancelled_at,
    cancellationReason: dto.cancellation_reason ?? "",
    paidAmount: safeNumber(dto.paid_amount),
    debtAmount: safeNumber(dto.debt_amount),
    cancellation: dto.cancellation ? mapCancellationDto(dto.cancellation) : null,
    createdAt: dto.created_at ?? "",
  };
}

export function mapScheduleItemDtoToDomain(dto: ScheduleItemDto): ScheduleItem {
  return {
    id: dto.id,
    dealId: dto.deal_id,
    paymentNumber: safeNumber(dto.payment_number),
    dueDate: dto.due_date,
    plannedAmount: safeNumber(dto.planned_amount),
    paidAmount: safeNumber(dto.paid_amount),
    remaining: safeNumber(dto.remaining),
    status: dto.status,
    penaltyAmount: safeNumber(dto.penalty_amount),
  };
}

// Legacy compatibility export (used by old hooks)
export { mapDealDtoToDomain as mapDealsDtoToDomain };
