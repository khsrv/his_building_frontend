"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseData, normalizeApiKeys, isApiRecord } from "@/shared/lib/http/api-response";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";
import type {
  FullDashboard,
  FullDashboardParams,
  FullDashboardSummary,
  DashboardAccount,
  DashboardCategoryExpense,
  DashboardIncomeSource,
  DashboardScheduleItem,
  DashboardReminder,
  DashboardExchangeRate,
  DashboardMonthlyItem,
} from "@/modules/dashboard/domain/dashboard";

// ─── Safe helpers ────────────────────────────────────────────────────────────

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function arr(v: unknown): Record<string, unknown>[] {
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is Record<string, unknown> =>
    typeof item === "object" && item !== null,
  );
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapSummary(raw: unknown): FullDashboardSummary {
  const d = isApiRecord(raw) ? raw : {};
  return {
    totalUnits: num(d["total_units"]),
    availableUnits: num(d["available_units"]),
    soldUnits: num(d["sold_units"]),
    bookedUnits: num(d["booked_units"]),
    reservedUnits: num(d["reserved_units"]),
    activeDeals: num(d["active_deals"]),
    totalRevenue: num(d["total_revenue"]),
    totalExpense: num(d["total_expense"]),
    netProfit: num(d["net_profit"]),
    totalDebt: num(d["total_debt"]),
    overdueCount: num(d["overdue_count"]),
    overdueAmount: num(d["overdue_amount"]),
    accountBalance: num(d["account_balance"]),
    totalArea: num(d["total_area"]),
    availableArea: num(d["available_area"]),
    totalDealsCount: num(d["total_deals_count"]),
    totalDealsArea: num(d["total_deals_area"]),
    averagePricePerSqm: num(d["average_price_per_sqm"]),
  };
}

function mapAccounts(raw: unknown): DashboardAccount[] {
  return arr(raw).map((d) => ({
    id: str(d["id"]),
    name: str(d["name"]),
    type: str(d["type"] ?? d["account_type"], "bank_account"),
    balance: num(d["balance"] ?? d["current_balance"]),
    currency: str(d["currency"], "USD"),
    propertyId: typeof d["property_id"] === "string" ? d["property_id"] : null,
  }));
}

function mapExpensesByCategory(raw: unknown): DashboardCategoryExpense[] {
  return arr(raw).map((d) => ({
    categoryId: str(d["category_id"]),
    categoryName: str(d["category_name"], "Без категории"),
    amount: num(d["amount"]),
    count: num(d["count"]),
  }));
}

function mapIncomeBySource(raw: unknown): DashboardIncomeSource[] {
  return arr(raw).map((d) => ({
    source: str(d["source"]),
    label: str(d["label"], str(d["source"])),
    amount: num(d["amount"]),
    count: num(d["count"]),
  }));
}

function mapScheduleItems(raw: unknown): DashboardScheduleItem[] {
  return arr(raw).map((d) => ({
    id: str(d["id"]),
    dealId: str(d["deal_id"]),
    dealNumber: str(d["deal_number"]),
    clientName: str(d["client_name"]),
    clientPhone: str(d["client_phone"]),
    amount: num(d["amount"]),
    currency: str(d["currency"], "USD"),
    dueDate: str(d["due_date"]),
    daysLeft: typeof d["days_left"] === "number" ? d["days_left"] : undefined,
    daysOverdue: typeof d["days_overdue"] === "number" ? d["days_overdue"] : undefined,
    propertyName: str(d["property_name"]),
    unitNumber: str(d["unit_number"]),
  }));
}

function mapReminders(raw: unknown): DashboardReminder[] {
  return arr(raw).map((d) => ({
    id: str(d["id"]),
    payeeType: str(d["payee_type"], "other"),
    payeeName: str(d["payee_name"]),
    amount: num(d["amount"]),
    currency: str(d["currency"], "USD"),
    dueDate: str(d["due_date"]),
    description: str(d["description"]),
  }));
}

function mapExchangeRates(raw: unknown): DashboardExchangeRate[] {
  return arr(raw).map((d) => ({
    id: str(d["id"]),
    fromCurrency: str(d["from_currency"]),
    toCurrency: str(d["to_currency"]),
    rate: num(d["rate"]),
    effectiveDate: str(d["effective_date"]),
  }));
}

function mapMonthlyChart(raw: unknown): DashboardMonthlyItem[] {
  return arr(raw).map((d) => ({
    month: str(d["month"]),
    income: num(d["income"]),
    expense: num(d["expense"]),
  }));
}

// ─── Fetch & map ─────────────────────────────────────────────────────────────

async function fetchFullDashboard(params?: FullDashboardParams): Promise<FullDashboard> {
  const query: Record<string, string | undefined> = {};
  if (params?.propertyId) query["property_id"] = params.propertyId;
  if (params?.dateFrom) query["date_from"] = params.dateFrom;
  if (params?.dateTo) query["date_to"] = params.dateTo;

  const response = await apiClient.get<{ data: Record<string, unknown> }>(
    "/api/v1/dashboard/full",
    query,
  );
  const data = getResponseData<Record<string, unknown>>(normalizeApiKeys(response));

  return {
    summary: mapSummary(data["summary"]),
    accounts: mapAccounts(data["accounts"]),
    expensesByCategory: mapExpensesByCategory(data["expenses_by_category"]),
    incomeBySource: mapIncomeBySource(data["income_by_source"]),
    upcomingPayments: mapScheduleItems(data["upcoming_payments"]),
    overduePayments: mapScheduleItems(data["overdue_payments"]),
    pendingReminders: mapReminders(data["pending_reminders"]),
    exchangeRates: mapExchangeRates(data["exchange_rates"]),
    monthlyChart: mapMonthlyChart(data["monthly_chart"]),
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFullDashboardQuery(params?: FullDashboardParams) {
  return useQuery({
    queryKey: dashboardKeys.full(params),
    queryFn: () => fetchFullDashboard(params),
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 minutes
  });
}
