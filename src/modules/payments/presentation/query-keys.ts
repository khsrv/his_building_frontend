export const paymentsQueryKeys = {
  all: ["payments"] as const,
  list: () => ["payments", "list"] as const,
  upcoming: (params: { month: number; year: number; propertyId?: string | undefined; status?: string | undefined }) =>
    ["payments", "upcoming", params] as const,
  overdue: () => ["payments", "overdue"] as const,
  properties: () => ["properties", "list-for-filter"] as const,
};
