"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import type { ManagerKpiItem } from "@/modules/dashboard/domain/dashboard";
import type { ManagerKpiResponseDto } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { mapManagerKpiItemDtoToDomain } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";

export function useDashboardManagerKpiQuery() {
  return useQuery({
    queryKey: dashboardKeys.managerKpi(),
    queryFn: async (): Promise<ManagerKpiItem[]> => {
      const response = await apiClient.get<{ data: ManagerKpiResponseDto }>(
        "/api/v1/dashboard/manager-kpi",
      );
      return (response.data.items ?? []).map(mapManagerKpiItemDtoToDomain);
    },
  });
}
