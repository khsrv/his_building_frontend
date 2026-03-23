import type { Deal, DealCancellation, RefundType, RefundStatus, ScheduleItem } from "@/modules/deals/domain/deal";
import type { DealDto, DealCancellationDto, ScheduleItemDto } from "@/modules/deals/infrastructure/dto";

const VALID_REFUND_TYPES: readonly string[] = ["full", "partial", "none"];
const VALID_REFUND_STATUSES: readonly string[] = ["pending", "refunded", "not_required"];

function mapCancellationDto(dto: DealCancellationDto): DealCancellation {
  return {
    reason: dto.reason ?? "",
    refundType: VALID_REFUND_TYPES.includes(dto.refund_type) ? (dto.refund_type as RefundType) : "none",
    paidAmount: Number(dto.paid_amount ?? 0),
    refundAmount: Number(dto.refund_amount ?? 0),
    penaltyAmount: Number(dto.penalty_amount ?? 0),
    penaltyReason: dto.penalty_reason ?? "",
    refundStatus: VALID_REFUND_STATUSES.includes(dto.refund_status) ? (dto.refund_status as RefundStatus) : "not_required",
    refundedAt: dto.refunded_at ?? null,
  };
}

export function mapDealDtoToDomain(dto: DealDto): Deal {
  return {
    id: dto.id,
    dealNumber: dto.deal_number ?? "",
    status: dto.status,
    paymentType: dto.payment_type,
    totalAmount: Number(dto.total_amount ?? 0),
    currency: dto.currency ?? "USD",
    discountAmount: Number(dto.discount_amount ?? 0),
    surchargeAmount: Number(dto.surcharge_amount ?? 0),
    finalAmount: Number(dto.final_amount ?? 0),
    downPayment: Number(dto.down_payment ?? 0),
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
    paidAmount: Number(dto.paid_amount ?? 0),
    debtAmount: Number(dto.debt_amount ?? 0),
    cancellation: dto.cancellation ? mapCancellationDto(dto.cancellation) : null,
    createdAt: dto.created_at ?? "",
  };
}

export function mapScheduleItemDtoToDomain(dto: ScheduleItemDto): ScheduleItem {
  return {
    id: dto.id,
    dealId: dto.deal_id,
    paymentNumber: Number(dto.payment_number ?? 0),
    dueDate: dto.due_date,
    plannedAmount: Number(dto.planned_amount ?? 0),
    paidAmount: Number(dto.paid_amount ?? 0),
    remaining: Number(dto.remaining ?? 0),
    status: dto.status,
    penaltyAmount: Number(dto.penalty_amount ?? 0),
  };
}

// Legacy compatibility export (used by old hooks)
export { mapDealDtoToDomain as mapDealsDtoToDomain };
