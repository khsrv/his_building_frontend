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
