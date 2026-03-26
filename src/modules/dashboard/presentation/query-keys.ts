import type { FullDashboardParams } from "@/modules/dashboard/domain/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  full: (params?: FullDashboardParams) => [...dashboardKeys.all, "full", params] as const,
  summary: (propertyId?: string) =>
    [...dashboardKeys.all, "summary", propertyId ?? "all"] as const,
  sales: (from: string, to: string, propertyId?: string) =>
    [...dashboardKeys.all, "sales", from, to, propertyId ?? "all"] as const,
  managerKpi: () => [...dashboardKeys.all, "manager-kpi"] as const,
  properties: () => [...dashboardKeys.all, "properties"] as const,
  propertyAnalytics: (propertyId: string) =>
    [...dashboardKeys.all, "property-analytics", propertyId] as const,
  exportSummary: (format: string, propertyId?: string) =>
    [...dashboardKeys.all, "export", format, propertyId ?? "all"] as const,
};
