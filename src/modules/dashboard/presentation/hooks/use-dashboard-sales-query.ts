"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import type { ApiResponse } from "@/shared/types/api";
import type { SalesChartItem } from "@/modules/dashboard/domain/dashboard";
import type {
  SalesChartResponseDto,
} from "@/modules/dashboard/infrastructure/dashboard-dto";
import { mapSalesChartItemDtoToDomain } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";

export function useDashboardSalesQuery(from: string, to: string, propertyId?: string) {
  return useQuery({
    queryKey: dashboardKeys.sales(from, to, propertyId),
    queryFn: async (): Promise<SalesChartItem[]> => {
      const query: Record<string, string> = { from, to };
      if (propertyId) {
        query["property_id"] = propertyId;
      }
      const response = await apiClient.get<ApiResponse<SalesChartResponseDto>>(
        "/api/v1/dashboard/sales",
        query,
      );
      return response.data.items.map(mapSalesChartItemDtoToDomain);
    },
  });
}
