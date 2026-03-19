import type { Deal, ScheduleItem } from "@/modules/deals/domain/deal";
import type { DealDto, ScheduleItemDto } from "@/modules/deals/infrastructure/dto";

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
    // API does not return joined names — use empty string fallbacks
    clientName: "",
    clientPhone: "",
    unitId: dto.unit_id ?? "",
    unitNumber: "",
    propertyId: "",
    propertyName: "",
    managerId: dto.manager_id ?? "",
    managerName: "",
    contractNumber: dto.contract_number ?? "",
    notes: dto.notes ?? "",
    signedAt: dto.signed_at,
    completedAt: dto.completed_at,
    cancelledAt: dto.cancelled_at,
    cancellationReason: dto.cancellation_reason ?? "",
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
