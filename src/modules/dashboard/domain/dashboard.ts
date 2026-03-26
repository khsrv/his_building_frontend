export interface DashboardSummary {
  readonly totalUnits: number;
  readonly soldUnits: number;
  readonly availableUnits: number;
  readonly bookedUnits: number;
  readonly reservedUnits: number;
  readonly totalRevenue: number;
  readonly totalDebt: number;
  readonly accountBalance: number;
  readonly activeDeals: number;
  readonly totalClients: number;
  readonly overdueCount: number;
}

export interface SalesChartItem {
  readonly month: string; // "2026-03"
  readonly count: number;
  readonly totalAmount: number;
}

export interface PaymentTypeBreakdown {
  readonly paymentType: string;
  readonly count: number;
  readonly totalAmount: number;
}

export interface FunnelConversion {
  readonly totalLeads: number;
  readonly totalDeals: number;
  readonly conversionPct: number;
}

export interface DashboardSales {
  readonly totalDeals: number;
  readonly totalAmount: number;
  readonly averageDeal: number;
  readonly funnelConversion: FunnelConversion;
  readonly byPaymentType: readonly PaymentTypeBreakdown[];
  readonly monthlySales: readonly SalesChartItem[];
}

export interface ManagerKpiItem {
  readonly managerId: string;
  readonly managerName: string;
  readonly dealsCount: number;
  readonly totalAmount: number;
  readonly clientCount: number;
}

export interface PropertyOption {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

// ─── Property analytics (GET /api/v1/dashboard/properties/:id) ─────────────

export interface PropertyAnalytics {
  readonly propertyId: string;
  readonly propertyName: string;
  readonly units: {
    readonly total: number;
    readonly available: number;
    readonly booked: number;
    readonly reserved: number;
    readonly sold: number;
  };
  readonly deals: {
    readonly active: number;
    readonly completed: number;
    readonly cancelled: number;
  };
  readonly revenue: {
    readonly total: number;
    readonly thisMonth: number;
  };
  readonly receivables: {
    readonly total: number;
  };
  readonly payments: {
    readonly overdueCount: number;
    readonly overdueAmount: number;
  };
  readonly salesByMonth: readonly SalesChartItem[];
  readonly dealsByPaymentType: readonly PaymentTypeBreakdown[];
}

// ─── Full Dashboard (aggregated endpoint) ───────────────────────────────────

export interface FullDashboardSummary {
  readonly totalUnits: number;
  readonly availableUnits: number;
  readonly soldUnits: number;
  readonly bookedUnits: number;
  readonly reservedUnits: number;
  readonly activeDeals: number;
  readonly totalRevenue: number;
  readonly totalExpense: number;
  readonly netProfit: number;
  readonly totalDebt: number;
  readonly overdueCount: number;
  readonly overdueAmount: number;
  readonly accountBalance: number;
  readonly totalArea: number;
  readonly availableArea: number;
  readonly totalDealsCount: number;
  readonly totalDealsArea: number;
  readonly averagePricePerSqm: number;
}

export interface DashboardAccount {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly balance: number;
  readonly currency: string;
  readonly propertyId: string | null;
}

export interface DashboardCategoryExpense {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly amount: number;
  readonly count: number;
}

export interface DashboardIncomeSource {
  readonly source: string;
  readonly label: string;
  readonly amount: number;
  readonly count: number;
}

export interface DashboardScheduleItem {
  readonly id: string;
  readonly dealId: string;
  readonly dealNumber: string;
  readonly clientName: string;
  readonly clientPhone: string;
  readonly amount: number;
  readonly currency: string;
  readonly dueDate: string;
  readonly daysLeft?: number | undefined;
  readonly daysOverdue?: number | undefined;
  readonly propertyName: string;
  readonly unitNumber: string;
}

export interface DashboardReminder {
  readonly id: string;
  readonly payeeType: string;
  readonly payeeName: string;
  readonly amount: number;
  readonly currency: string;
  readonly dueDate: string;
  readonly description: string;
}

export interface DashboardExchangeRate {
  readonly id: string;
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly rate: number;
  readonly effectiveDate: string;
}

export interface DashboardMonthlyItem {
  readonly month: string;
  readonly income: number;
  readonly expense: number;
}

export interface FullDashboard {
  readonly summary: FullDashboardSummary;
  readonly accounts: readonly DashboardAccount[];
  readonly expensesByCategory: readonly DashboardCategoryExpense[];
  readonly incomeBySource: readonly DashboardIncomeSource[];
  readonly upcomingPayments: readonly DashboardScheduleItem[];
  readonly overduePayments: readonly DashboardScheduleItem[];
  readonly pendingReminders: readonly DashboardReminder[];
  readonly exchangeRates: readonly DashboardExchangeRate[];
  readonly monthlyChart: readonly DashboardMonthlyItem[];
}

export interface FullDashboardParams {
  propertyId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

export interface DashboardExportResult {
  readonly format: string;
  readonly note: string;
  readonly summary: DashboardSummary;
}
