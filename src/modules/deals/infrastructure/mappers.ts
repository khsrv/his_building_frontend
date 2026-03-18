import type { Deal, ScheduleItem } from "@/modules/deals/domain/deal";
import type { DealDto, ScheduleItemDto } from "@/modules/deals/infrastructure/dto";

export function mapDealDtoToDomain(dto: DealDto): Deal {
  return {
    id: dto.id,
    dealNumber: dto.deal_number,
    status: dto.status,
    paymentType: dto.payment_type,
    totalAmount: dto.total_amount,
    currency: dto.currency,
    discountAmount: dto.discount_amount,
    surchargeAmount: dto.surcharge_amount,
    finalAmount: dto.final_amount,
    downPayment: dto.down_payment,
    installmentMonths: dto.installment_months,
    clientId: dto.client_id,
    // API does not return joined names — use empty string fallbacks
    clientName: "",
    clientPhone: "",
    unitId: dto.unit_id,
    unitNumber: "",
    propertyId: "",
    propertyName: "",
    managerId: dto.manager_id,
    managerName: "",
    contractNumber: dto.contract_number,
    notes: dto.notes,
    signedAt: dto.signed_at,
    completedAt: dto.completed_at,
    cancelledAt: dto.cancelled_at,
    cancellationReason: dto.cancellation_reason,
    createdAt: dto.created_at,
  };
}

export function mapScheduleItemDtoToDomain(dto: ScheduleItemDto): ScheduleItem {
  return {
    id: dto.id,
    dealId: dto.deal_id,
    paymentNumber: dto.payment_number,
    dueDate: dto.due_date,
    plannedAmount: dto.planned_amount,
    paidAmount: dto.paid_amount,
    remaining: dto.remaining,
    status: dto.status,
    penaltyAmount: dto.penalty_amount,
  };
}

// Legacy compatibility export (used by old hooks)
export { mapDealDtoToDomain as mapDealsDtoToDomain };
