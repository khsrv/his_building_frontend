"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseData, normalizeApiKeys } from "@/shared/lib/http/api-response";
import type { DashboardSummary } from "@/modules/dashboard/domain/dashboard";
import type { DashboardSummaryDto } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { mapSummaryDtoToDomain } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";

export function useDashboardSummaryQuery(propertyId?: string) {
  return useQuery({
    queryKey: dashboardKeys.summary(propertyId),
    queryFn: async (): Promise<DashboardSummary> => {
      const query: Record<string, string> = {};
      if (propertyId) {
        query["property_id"] = propertyId;
      }
      const response = await apiClient.get<{ data: DashboardSummaryDto }>(
        "/api/v1/dashboard/summary",
        query,
      );
      return mapSummaryDtoToDomain(
        getResponseData<DashboardSummaryDto>(normalizeApiKeys(response)),
      );
    },
  });
}
