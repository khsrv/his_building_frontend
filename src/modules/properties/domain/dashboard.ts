// ─── Dashboard types ─────────────────────────────────────────────────────────

export interface PropertyDashboard {
  readonly propertyId: string;
  readonly propertyName: string;
  readonly totalUnits: number;
  readonly soldUnits: number;
  readonly availableUnits: number;
  readonly bookedUnits: number;
  readonly salesPct: number;
  readonly avgPricePerSqm: number;
  readonly totalRevenue: number;
  readonly byRooms: readonly RoomBreakdown[];
}

export interface RoomBreakdown {
  readonly rooms: number;
  readonly total: number;
  readonly sold: number;
  readonly available: number;
}

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

export interface DashboardSales {
  readonly totalDeals: number;
  readonly totalAmount: number;
  readonly averageDeal: number;
  readonly monthlySales: readonly MonthlySale[];
  readonly byPaymentType: readonly PaymentTypeBreakdown[];
}

export interface MonthlySale {
  readonly month: string;
  readonly count: number;
  readonly totalAmount: number;
}

export interface PaymentTypeBreakdown {
  readonly paymentType: string;
  readonly count: number;
  readonly totalAmount: number;
}

export interface PropertyCostRow {
  readonly categoryName: string;
  readonly totalAmount: number;
}
