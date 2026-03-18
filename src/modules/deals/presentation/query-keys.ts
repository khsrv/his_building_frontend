import type { DealsListParams } from "@/modules/deals/domain/deal";

export const dealKeys = {
  all: ["deals"] as const,
  lists: () => ["deals", "list"] as const,
  list: (params?: DealsListParams) => ["deals", "list", params] as const,
  details: () => ["deals", "detail"] as const,
  detail: (id: string) => ["deals", "detail", id] as const,
  schedules: () => ["deals", "schedule"] as const,
  schedule: (dealId: string) => ["deals", "schedule", dealId] as const,
  payments: (dealId: string) => ["deals", "payments", dealId] as const,
  clientSearch: (search: string) => ["deals", "client-search", search] as const,
  units: (propertyId: string) => ["deals", "units", propertyId] as const,
  properties: () => ["deals", "properties"] as const,
};

// Legacy export for backward compat
export const dealsQueryKeys = {
  all: ["deals"] as const,
  list: () => ["deals", "list"] as const,
};
