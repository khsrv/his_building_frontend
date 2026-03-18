export interface DashboardSummary {
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
  readonly payments: {
    readonly overdueCount: number;
    readonly overdueAmount: number;
  };
  readonly revenue: {
    readonly total: number;
    readonly thisMonth: number;
  };
  readonly receivables: {
    readonly total: number;
  };
}

export interface SalesChartItem {
  readonly month: string; // "2024-01"
  readonly totalAmount: number;
  readonly dealsCount: number;
}

export interface ManagerKpiItem {
  readonly managerId: string;
  readonly managerName: string;
  readonly dealsCount: number;
  readonly totalRevenue: number;
  readonly conversionRate: number;
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

export interface PaymentTypeBreakdown {
  readonly paymentType: string;
  readonly count: number;
  readonly totalAmount: number;
}
