import type {
  OverduePayment,
  PaymentsItem,
  PropertyOption,
  SchedulePaymentStatus,
  UpcomingPayment,
} from "@/modules/payments/domain/entities";
import type {
  OverduePaymentDto,
  PaymentsItemDto,
  PropertyDto,
  UpcomingPaymentDto,
} from "@/modules/payments/infrastructure/dto";

export function mapPaymentsDtoToDomain(dto: PaymentsItemDto): PaymentsItem {
  return {
    id: dto.id,
    title: dto.title,
    createdAtIso: dto.created_at,
  };
}

function toScheduleStatus(raw: string): SchedulePaymentStatus {
  const allowed: readonly SchedulePaymentStatus[] = [
    "pending",
    "upcoming",
    "paid",
    "partially_paid",
    "overdue",
  ];
  return (allowed as readonly string[]).includes(raw)
    ? (raw as SchedulePaymentStatus)
    : "pending";
}

export function mapUpcomingPaymentDto(dto: UpcomingPaymentDto): UpcomingPayment {
  return {
    id: dto.id,
    dueDate: dto.due_date,
    clientName: dto.client_name,
    clientPhone: dto.client_phone,
    unitNumber: dto.unit_number,
    propertyName: dto.property_name,
    dealId: dto.deal_id,
    dealNumber: dto.deal_number,
    plannedAmount: dto.planned_amount,
    paidAmount: dto.paid_amount,
    remainingAmount: dto.remaining_amount,
    status: toScheduleStatus(dto.status),
    currency: dto.currency,
  };
}

export function mapOverduePaymentDto(dto: OverduePaymentDto): OverduePayment {
  return {
    id: dto.id,
    dueDate: dto.due_date,
    daysOverdue: dto.days_overdue,
    clientName: dto.client_name,
    clientPhone: dto.client_phone,
    unitNumber: dto.unit_number,
    propertyName: dto.property_name,
    dealId: dto.deal_id,
    dealNumber: dto.deal_number,
    plannedAmount: dto.planned_amount,
    paidAmount: dto.paid_amount,
    remainingAmount: dto.remaining_amount,
    currency: dto.currency,
  };
}

export function mapPropertyDto(dto: PropertyDto): PropertyOption {
  return { id: dto.id, name: dto.name };
}
