import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSales } from "@/modules/properties/infrastructure/dashboard-repository";

export function useDashboardSalesQuery(propertyId?: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", "sales", propertyId ?? "all"],
    queryFn: () => fetchDashboardSales(propertyId),
    staleTime: 60_000,
  });
}
