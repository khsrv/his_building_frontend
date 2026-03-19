// ─── Advanced Domain Types ──────────────────────────────────────────────────

export interface PricingRule {
  readonly id: string;
  readonly propertyId: string;
  readonly name: string;
  readonly ruleType: string;
  readonly conditionValue: number | null;
  readonly adjustmentPct: number;
  readonly priority: number;
  readonly validFrom: string | null;
  readonly validTo: string | null;
  readonly createdAt: string;
}

export interface Broker {
  readonly id: string;
  readonly fullName: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly companyName: string | null;
  readonly commissionPct: number | null;
  readonly userId: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
}

export interface BrokerDeal {
  readonly id: string;
  readonly brokerId: string;
  readonly dealId: string;
  readonly dealNumber: string;
  readonly clientName: string;
  readonly commissionPct: number;
  readonly dealAmount: number;
  readonly createdAt: string;
}

export interface Invoice {
  readonly id: string;
  readonly tenantId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly paidAt: string | null;
  readonly createdAt: string;
}

export interface UnitPriceHistoryItem {
  readonly id: string;
  readonly unitId: string;
  readonly oldPrice: number;
  readonly newPrice: number;
  readonly reason: string;
  readonly createdAt: string;
}

// ─── Input types for mutations ──────────────────────────────────────────────

export interface CreatePricingRuleInput {
  propertyId: string;
  name: string;
  ruleType: string;
  conditionValue?: number | undefined;
  adjustmentPct: number;
  priority?: number | undefined;
  validFrom?: string | undefined;
  validTo?: string | undefined;
}

export interface CreateBrokerInput {
  fullName: string;
  phone?: string | undefined;
  email?: string | undefined;
  companyName?: string | undefined;
  commissionPct?: number | undefined;
  userId?: string | undefined;
  notes?: string | undefined;
}

export interface AssignBrokerDealInput {
  brokerId: string;
  dealId: string;
  commissionPct?: number | undefined;
  dealAmount?: number | undefined;
}
