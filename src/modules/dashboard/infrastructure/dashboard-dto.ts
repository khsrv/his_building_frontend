import type {
  DashboardSummary,
  SalesChartItem,
  ManagerKpiItem,
  PropertyOption,
  PropertyAnalytics,
  PaymentTypeBreakdown,
} from "@/modules/dashboard/domain/dashboard";

// ─── DTOs (snake_case from backend) ──────────────────────────────────────────

export interface DashboardSummaryDto {
  units: {
    total: number;
    available: number;
    booked: number;
    reserved: number;
    sold: number;
  };
  deals: {
    active: number;
    completed: number;
    cancelled: number;
  };
  payments: {
    overdue_count: number;
    overdue_amount: number;
  };
  revenue: {
    total: number;
    this_month: number;
  };
  receivables: {
    total: number;
  };
}

export interface SalesChartItemDto {
  month: string;
  total_amount: number;
  deals_count: number;
}

export interface SalesChartResponseDto {
  items: SalesChartItemDto[];
}

export interface ManagerKpiItemDto {
  manager_id: string;
  manager_name: string;
  deals_count: number;
  total_revenue: number;
  conversion_rate: number;
}

export interface ManagerKpiResponseDto {
  items: ManagerKpiItemDto[];
}

export interface PropertyItemDto {
  id: string;
  name: string;
  status: string;
}

export interface PropertiesListDto {
  items: PropertyItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function mapSummaryDtoToDomain(dto: DashboardSummaryDto): DashboardSummary {
  return {
    units: {
      total: dto.units.total,
      available: dto.units.available,
      booked: dto.units.booked,
      reserved: dto.units.reserved,
      sold: dto.units.sold,
    },
    deals: {
      active: dto.deals.active,
      completed: dto.deals.completed,
      cancelled: dto.deals.cancelled,
    },
    payments: {
      overdueCount: dto.payments.overdue_count,
      overdueAmount: dto.payments.overdue_amount,
    },
    revenue: {
      total: dto.revenue.total,
      thisMonth: dto.revenue.this_month,
    },
    receivables: {
      total: dto.receivables.total,
    },
  };
}

export function mapSalesChartItemDtoToDomain(dto: SalesChartItemDto): SalesChartItem {
  return {
    month: dto.month,
    totalAmount: dto.total_amount,
    dealsCount: dto.deals_count,
  };
}

export function mapManagerKpiItemDtoToDomain(dto: ManagerKpiItemDto): ManagerKpiItem {
  return {
    managerId: dto.manager_id,
    managerName: dto.manager_name,
    dealsCount: dto.deals_count,
    totalRevenue: dto.total_revenue,
    conversionRate: dto.conversion_rate,
  };
}

export function mapPropertyItemDtoToDomain(dto: PropertyItemDto): PropertyOption {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
  };
}

// ─── Property Analytics DTOs ──────────────────────────────────────────────────

export interface PaymentTypeBreakdownDto {
  payment_type: string;
  count: number;
  total_amount: number;
}

export interface PropertyAnalyticsDto {
  property_id: string;
  property_name: string;
  units: {
    total: number;
    available: number;
    booked: number;
    reserved: number;
    sold: number;
  };
  deals: {
    active: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    this_month: number;
  };
  receivables: {
    total: number;
  };
  payments: {
    overdue_count: number;
    overdue_amount: number;
  };
  sales_by_month?: SalesChartItemDto[];
  deals_by_payment_type?: PaymentTypeBreakdownDto[];
}

export function mapPaymentTypeBreakdownDtoToDomain(dto: PaymentTypeBreakdownDto): PaymentTypeBreakdown {
  return {
    paymentType: dto.payment_type,
    count: dto.count,
    totalAmount: dto.total_amount,
  };
}

export function mapPropertyAnalyticsDtoToDomain(dto: PropertyAnalyticsDto): PropertyAnalytics {
  return {
    propertyId: dto.property_id,
    propertyName: dto.property_name,
    units: {
      total: dto.units.total,
      available: dto.units.available,
      booked: dto.units.booked,
      reserved: dto.units.reserved,
      sold: dto.units.sold,
    },
    deals: {
      active: dto.deals.active,
      completed: dto.deals.completed,
      cancelled: dto.deals.cancelled,
    },
    revenue: {
      total: dto.revenue.total,
      thisMonth: dto.revenue.this_month,
    },
    receivables: {
      total: dto.receivables.total,
    },
    payments: {
      overdueCount: dto.payments.overdue_count,
      overdueAmount: dto.payments.overdue_amount,
    },
    salesByMonth: (dto.sales_by_month ?? []).map(mapSalesChartItemDtoToDomain),
    dealsByPaymentType: (dto.deals_by_payment_type ?? []).map(mapPaymentTypeBreakdownDtoToDomain),
  };
}
