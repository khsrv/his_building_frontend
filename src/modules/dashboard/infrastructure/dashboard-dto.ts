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
  funnel_conversion?: FunnelConversionDto | null;
  by_payment_type?: PaymentTypeBreakdownDto[];
  monthly_sales?: SalesChartItemDto[];
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
  status?: string;
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
    totalUnits: Number(dto.total_units ?? 0),
    soldUnits: Number(dto.sold_units ?? 0),
    availableUnits: Number(dto.available_units ?? 0),
    bookedUnits: Number(dto.booked_units ?? 0),
    reservedUnits: Number(dto.reserved_units ?? 0),
    totalRevenue: Number(dto.total_revenue ?? 0),
    totalDebt: Number(dto.total_debt ?? 0),
    accountBalance: Number(dto.account_balance ?? 0),
    activeDeals: Number(dto.active_deals ?? 0),
    totalClients: Number(dto.total_clients ?? 0),
    overdueCount: Number(dto.overdue_count ?? 0),
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
  const funnel = dto.funnel_conversion ?? {
    total_leads: 0,
    total_deals: 0,
    conversion_pct: 0,
  };

  return {
    totalDeals: Number(dto.total_deals ?? 0),
    totalAmount: Number(dto.total_amount ?? 0),
    averageDeal: Number(dto.average_deal ?? 0),
    funnelConversion: mapFunnelConversionDtoToDomain(funnel),
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
    status: dto.status ?? "",
  };
}

// ─── Property Analytics DTOs ──────────────────────────────────────────────────

export interface PropertyAnalyticsDto {
  property_id: string;
  property_name: string;
  units?: {
    total?: number;
    available?: number;
    booked?: number;
    reserved?: number;
    sold?: number;
  };
  deals?: {
    active?: number;
    completed?: number;
    cancelled?: number;
  };
  revenue?: {
    total?: number;
    this_month?: number;
  };
  receivables?: {
    total?: number;
  };
  payments?: {
    overdue_count?: number;
    overdue_amount?: number;
  };

  // Runtime fallback shape currently used by backend (flat fields)
  total_units?: number;
  available_units?: number;
  booked_units?: number;
  reserved_units?: number;
  sold_units?: number;
  total_revenue?: number;
  overdue_count?: number;
  overdue_amount?: number;

  sales_by_month?: SalesChartItemDto[];
  deals_by_payment_type?: PaymentTypeBreakdownDto[];

  // Possible alternative field names from other backend versions.
  monthly_sales?: SalesChartItemDto[];
  by_payment_type?: PaymentTypeBreakdownDto[];
}

export function mapPropertyAnalyticsDtoToDomain(dto: PropertyAnalyticsDto): PropertyAnalytics {
  return {
    propertyId: dto.property_id,
    propertyName: dto.property_name,
    units: {
      total: Number(dto.units?.total ?? dto.total_units ?? 0),
      available: Number(dto.units?.available ?? dto.available_units ?? 0),
      booked: Number(dto.units?.booked ?? dto.booked_units ?? 0),
      reserved: Number(dto.units?.reserved ?? dto.reserved_units ?? 0),
      sold: Number(dto.units?.sold ?? dto.sold_units ?? 0),
    },
    deals: {
      active: Number(dto.deals?.active ?? 0),
      completed: Number(dto.deals?.completed ?? 0),
      cancelled: Number(dto.deals?.cancelled ?? 0),
    },
    revenue: {
      total: Number(dto.revenue?.total ?? dto.total_revenue ?? 0),
      thisMonth: Number(dto.revenue?.this_month ?? 0),
    },
    receivables: {
      total: Number(dto.receivables?.total ?? 0),
    },
    payments: {
      overdueCount: Number(dto.payments?.overdue_count ?? dto.overdue_count ?? 0),
      overdueAmount: Number(dto.payments?.overdue_amount ?? dto.overdue_amount ?? 0),
    },
    salesByMonth: (dto.sales_by_month ?? dto.monthly_sales ?? []).map(mapSalesChartItemDtoToDomain),
    dealsByPaymentType: (dto.deals_by_payment_type ?? dto.by_payment_type ?? []).map(mapPaymentTypeBreakdownDtoToDomain),
  };
}
