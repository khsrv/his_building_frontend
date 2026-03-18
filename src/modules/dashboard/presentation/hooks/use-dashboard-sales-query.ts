"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import type { DashboardSales } from "@/modules/dashboard/domain/dashboard";
import type { DashboardSalesDto } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { mapSalesDtoToDomain } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";

export function useDashboardSalesQuery(from: string, to: string, propertyId?: string) {
  return useQuery({
    queryKey: dashboardKeys.sales(from, to, propertyId),
    queryFn: async (): Promise<DashboardSales> => {
      const query: Record<string, string> = { from, to };
      if (propertyId) {
        query["property_id"] = propertyId;
      }
      const response = await apiClient.get<{ data: DashboardSalesDto }>(
        "/api/v1/dashboard/sales",
        query,
      );
      return mapSalesDtoToDomain(response.data);
    },
  });
}
