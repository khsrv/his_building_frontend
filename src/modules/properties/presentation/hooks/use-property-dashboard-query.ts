import { useQuery } from "@tanstack/react-query";
import { fetchPropertyDashboard } from "@/modules/properties/infrastructure/dashboard-repository";

export function usePropertyDashboardQuery(propertyId: string) {
  return useQuery({
    queryKey: ["dashboard", "property", propertyId],
    queryFn: () => fetchPropertyDashboard(propertyId),
    enabled: Boolean(propertyId),
    staleTime: 30_000,
  });
}
