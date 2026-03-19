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
  const remainingAmount =
    dto.remaining_amount ?? dto.remaining ?? Math.max(0, dto.planned_amount - dto.paid_amount);

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
    remainingAmount,
    status: toScheduleStatus(dto.status),
    currency: dto.currency,
  };
}

export function mapOverduePaymentDto(dto: OverduePaymentDto): OverduePayment {
  const schedule = dto.schedule_item;
  const dueDate = schedule?.due_date ?? dto.due_date ?? "";
  const plannedAmount = schedule?.planned_amount ?? dto.planned_amount ?? 0;
  const paidAmount = schedule?.paid_amount ?? dto.paid_amount ?? 0;
  const remainingAmount =
    schedule?.remaining_amount ??
    schedule?.remaining ??
    dto.remaining_amount ??
    dto.remaining ??
    Math.max(0, plannedAmount - paidAmount);
  const dueDateMs = dueDate ? new Date(dueDate).getTime() : Number.NaN;
  const computedDaysOverdue =
    Number.isFinite(dueDateMs)
      ? Math.max(0, Math.floor((Date.now() - dueDateMs) / (24 * 60 * 60 * 1000)))
      : 0;

  return {
    id: dto.id ?? schedule?.id ?? "",
    dueDate,
    daysOverdue: dto.days_overdue ?? computedDaysOverdue,
    clientName: dto.client_name ?? "",
    clientPhone: dto.client_phone ?? "",
    unitNumber: dto.unit_number ?? "",
    propertyName: dto.property_name ?? "—",
    dealId: dto.deal_id ?? schedule?.deal_id ?? "",
    dealNumber: dto.deal_number ?? "",
    plannedAmount,
    paidAmount,
    remainingAmount,
    currency: dto.currency ?? schedule?.currency ?? "TJS",
  };
}

export function mapPropertyDto(dto: PropertyDto): PropertyOption {
  return { id: dto.id, name: dto.name };
}
