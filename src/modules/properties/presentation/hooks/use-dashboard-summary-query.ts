import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "@/modules/properties/infrastructure/dashboard-repository";

export function useDashboardSummaryQuery(propertyId?: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", "summary", propertyId ?? "all"],
    queryFn: () => fetchDashboardSummary(propertyId),
    staleTime: 30_000,
  });
}
