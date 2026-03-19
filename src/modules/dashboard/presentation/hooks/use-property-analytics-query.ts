"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseData, normalizeApiKeys } from "@/shared/lib/http/api-response";
import type { PropertyAnalytics } from "@/modules/dashboard/domain/dashboard";
import type { PropertyAnalyticsDto } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { mapPropertyAnalyticsDtoToDomain } from "@/modules/dashboard/infrastructure/dashboard-dto";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";

export function usePropertyAnalyticsQuery(propertyId: string) {
  return useQuery({
    queryKey: dashboardKeys.propertyAnalytics(propertyId),
    queryFn: async (): Promise<PropertyAnalytics> => {
      const response = await apiClient.get<{ data: PropertyAnalyticsDto }>(
        `/api/v1/dashboard/properties/${propertyId}`,
      );
      return mapPropertyAnalyticsDtoToDomain(
        getResponseData<PropertyAnalyticsDto>(normalizeApiKeys(response)),
      );
    },
    enabled: propertyId.length > 0,
  });
}
