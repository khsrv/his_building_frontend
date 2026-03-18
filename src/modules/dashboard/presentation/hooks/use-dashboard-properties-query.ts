"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import type { PropertyOption } from "@/modules/dashboard/domain/dashboard";
import type { PropertiesListDto } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { mapPropertyItemDtoToDomain } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";

export function useDashboardPropertiesQuery() {
  return useQuery({
    queryKey: dashboardKeys.properties(),
    queryFn: async (): Promise<PropertyOption[]> => {
      const response = await apiClient.get<{ data: PropertiesListDto }>(
        "/api/v1/properties",
        { limit: 100 },
      );
      return (response.data.items ?? []).map(mapPropertyItemDtoToDomain);
    },
  });
}
