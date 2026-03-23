import { apiClient } from "@/shared/lib/http/api-client";
import { normalizeApiKeys, getResponseData } from "@/shared/lib/http/api-response";
import type {
  PropertyDashboard,
  RoomBreakdown,
  DashboardSummary,
  DashboardSales,
  MonthlySale,
  PaymentTypeBreakdown,
  PropertyCostRow,
} from "@/modules/properties/domain/dashboard";

// ─── Property dashboard ──────────────────────────────────────────────────────

interface PropertyDashboardDto {
  property_id: string;
  property_name: string;
  total_units: number;
  sold_units: number;
  available_units: number;
  booked_units: number;
  sales_pct: number;
  avg_price_per_sqm: number;
  total_revenue: number;
  by_rooms?: RoomBreakdownDto[];
}

interface RoomBreakdownDto {
  rooms: number;
  total: number;
  sold: number;
  available: number;
}

export async function fetchPropertyDashboard(propertyId: string): Promise<PropertyDashboard> {
  const res = await apiClient.get<unknown>(`/api/v1/dashboard/properties/${propertyId}`);
  const data = getResponseData<PropertyDashboardDto>(normalizeApiKeys(res));
  return mapPropertyDashboard(data);
}

function mapPropertyDashboard(dto: PropertyDashboardDto): PropertyDashboard {
  return {
    propertyId: dto.property_id ?? "",
    propertyName: dto.property_name ?? "",
    totalUnits: dto.total_units ?? 0,
    soldUnits: dto.sold_units ?? 0,
    availableUnits: dto.available_units ?? 0,
    bookedUnits: dto.booked_units ?? 0,
    salesPct: dto.sales_pct ?? 0,
    avgPricePerSqm: dto.avg_price_per_sqm ?? 0,
    totalRevenue: dto.total_revenue ?? 0,
    byRooms: (dto.by_rooms ?? []).map(mapRoomBreakdown),
  };
}

function mapRoomBreakdown(dto: RoomBreakdownDto): RoomBreakdown {
  return {
    rooms: dto.rooms,
    total: dto.total,
    sold: dto.sold,
    available: dto.available,
  };
}

// ─── Summary ─────────────────────────────────────────────────────────────────

interface SummaryDto {
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

export async function fetchDashboardSummary(propertyId?: string | undefined): Promise<DashboardSummary> {
  const query: Record<string, string> = {};
  if (propertyId) query["property_id"] = propertyId;
  const res = await apiClient.get<unknown>("/api/v1/dashboard/summary", query);
  const data = getResponseData<SummaryDto>(normalizeApiKeys(res));
  return {
    totalUnits: data.total_units ?? 0,
    soldUnits: data.sold_units ?? 0,
    availableUnits: data.available_units ?? 0,
    bookedUnits: data.booked_units ?? 0,
    reservedUnits: data.reserved_units ?? 0,
    totalRevenue: data.total_revenue ?? 0,
    totalDebt: data.total_debt ?? 0,
    accountBalance: data.account_balance ?? 0,
    activeDeals: data.active_deals ?? 0,
    totalClients: data.total_clients ?? 0,
    overdueCount: data.overdue_count ?? 0,
  };
}

// ─── Sales ───────────────────────────────────────────────────────────────────

interface SalesDto {
  total_deals: number;
  total_amount: number;
  average_deal: number;
  monthly_sales?: MonthlySaleDto[];
  by_payment_type?: PaymentTypeDto[];
}

interface MonthlySaleDto {
  month: string;
  count: number;
  total_amount: number;
}

interface PaymentTypeDto {
  payment_type: string;
  count: number;
  total_amount: number;
}

export async function fetchDashboardSales(
  propertyId?: string | undefined,
  from?: string | undefined,
  to?: string | undefined,
): Promise<DashboardSales> {
  const query: Record<string, string> = {};
  if (propertyId) query["property_id"] = propertyId;
  if (from) query["from"] = from;
  if (to) query["to"] = to;
  const res = await apiClient.get<unknown>("/api/v1/dashboard/sales", query);
  const data = getResponseData<SalesDto>(normalizeApiKeys(res));
  return {
    totalDeals: data.total_deals ?? 0,
    totalAmount: data.total_amount ?? 0,
    averageDeal: data.average_deal ?? 0,
    monthlySales: (data.monthly_sales ?? []).map((m): MonthlySale => ({
      month: m.month,
      count: m.count,
      totalAmount: m.total_amount,
    })),
    byPaymentType: (data.by_payment_type ?? []).map((p): PaymentTypeBreakdown => ({
      paymentType: p.payment_type,
      count: p.count,
      totalAmount: p.total_amount,
    })),
  };
}

// ─── Property costs ──────────────────────────────────────────────────────────

interface CostRowDto {
  category_name: string;
  total_amount: number;
}

export async function fetchPropertyCosts(propertyId: string): Promise<PropertyCostRow[]> {
  const res = await apiClient.get<unknown>(`/api/v1/reports/property-cost/${propertyId}`);
  const data = getResponseData<CostRowDto[]>(normalizeApiKeys(res));
  const rows = Array.isArray(data) ? data : [];
  return rows.map((r): PropertyCostRow => ({
    categoryName: r.category_name ?? "",
    totalAmount: r.total_amount ?? 0,
  }));
}
