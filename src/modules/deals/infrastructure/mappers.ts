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
    downPayment: dto.down_payment,
    installmentMonths: dto.installment_months,
    remainingAmount: dto.remaining_amount,
    clientId: dto.client_id,
    clientName: dto.client_name,
    clientPhone: dto.client_phone,
    unitId: dto.unit_id,
    unitNumber: dto.unit_number,
    propertyId: dto.property_id,
    propertyName: dto.property_name,
    managerName: dto.manager_name,
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
    remainingAmount: dto.remaining_amount,
    status: dto.status,
    paidAt: dto.paid_at,
  };
}

// Legacy compatibility export (used by old hooks)
export { mapDealDtoToDomain as mapDealsDtoToDomain };
