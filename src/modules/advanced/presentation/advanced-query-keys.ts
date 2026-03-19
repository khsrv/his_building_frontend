export const advancedKeys = {
  all: ["advanced"] as const,

  // Pricing rules
  pricingRules: (propertyId?: string) => ["advanced", "pricing-rules", propertyId] as const,
  unitPriceHistory: (unitId?: string) => ["advanced", "unit-price-history", unitId] as const,

  // Brokers
  brokers: () => ["advanced", "brokers"] as const,
  brokerDeals: (brokerId: string) => ["advanced", "brokers", brokerId, "deals"] as const,

  // Invoices
  invoices: (status?: string) => ["advanced", "invoices", status] as const,
};
