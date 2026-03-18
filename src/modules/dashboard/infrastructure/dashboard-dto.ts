import type {
  DashboardSummary,
  DashboardSales,
  SalesChartItem,
  ManagerKpiItem,
  PropertyOption,
  PropertyAnalytics,
  PaymentTypeBreakdown,
  FunnelConversion,
} from "@/modules/dashboard/domain/dashboard";

// ─── DTOs (snake_case from backend) ──────────────────────────────────────────

export interface DashboardSummaryDto {
  total_units: number;
  sold_units: number;
  available_units: number;
  booked_units: number;
  reserved_units: number;
  total_revenue: number;
  total_debt: number;
  account_balance: number;
  active_deals: number;
  total_clients: number;
  overdue_count: number;
}

export interface SalesChartItemDto {
  month: string;
  count: number;
  total_amount: number;
}

export interface PaymentTypeBreakdownDto {
  payment_type: string;
  count: number;
  total_amount: number;
}

export interface FunnelConversionDto {
  total_leads: number;
  total_deals: number;
  conversion_pct: number;
}

export interface DashboardSalesDto {
  total_deals: number;
  total_amount: number;
  average_deal: number;
  funnel_conversion: FunnelConversionDto;
  by_payment_type: PaymentTypeBreakdownDto[];
  monthly_sales: SalesChartItemDto[];
}

export interface ManagerKpiItemDto {
  manager_id: string;
  manager_name: string;
  deals_count: number;
  total_amount: number;
  client_count: number;
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
    totalUnits: dto.total_units,
    soldUnits: dto.sold_units,
    availableUnits: dto.available_units,
    bookedUnits: dto.booked_units,
    reservedUnits: dto.reserved_units,
    totalRevenue: dto.total_revenue,
    totalDebt: dto.total_debt,
    accountBalance: dto.account_balance,
    activeDeals: dto.active_deals,
    totalClients: dto.total_clients,
    overdueCount: dto.overdue_count,
  };
}

export function mapSalesChartItemDtoToDomain(dto: SalesChartItemDto): SalesChartItem {
  return {
    month: dto.month,
    count: dto.count,
    totalAmount: dto.total_amount,
  };
}

export function mapPaymentTypeBreakdownDtoToDomain(dto: PaymentTypeBreakdownDto): PaymentTypeBreakdown {
  return {
    paymentType: dto.payment_type,
    count: dto.count,
    totalAmount: dto.total_amount,
  };
}

export function mapFunnelConversionDtoToDomain(dto: FunnelConversionDto): FunnelConversion {
  return {
    totalLeads: dto.total_leads,
    totalDeals: dto.total_deals,
    conversionPct: dto.conversion_pct,
  };
}

export function mapSalesDtoToDomain(dto: DashboardSalesDto): DashboardSales {
  return {
    totalDeals: dto.total_deals,
    totalAmount: dto.total_amount,
    averageDeal: dto.average_deal,
    funnelConversion: mapFunnelConversionDtoToDomain(dto.funnel_conversion),
    byPaymentType: (dto.by_payment_type ?? []).map(mapPaymentTypeBreakdownDtoToDomain),
    monthlySales: (dto.monthly_sales ?? []).map(mapSalesChartItemDtoToDomain),
  };
}

export function mapManagerKpiItemDtoToDomain(dto: ManagerKpiItemDto): ManagerKpiItem {
  return {
    managerId: dto.manager_id,
    managerName: dto.manager_name,
    dealsCount: dto.deals_count,
    totalAmount: dto.total_amount,
    clientCount: dto.client_count,
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
