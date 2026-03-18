"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import type { PropertiesListResponseDto } from "@/modules/payments/infrastructure/dto";
import { mapPropertyDto } from "@/modules/payments/infrastructure/mappers";
import { paymentsQueryKeys } from "@/modules/payments/presentation/query-keys";

export function usePropertiesFilterQuery() {
  return useQuery({
    queryKey: paymentsQueryKeys.properties(),
    queryFn: async () => {
      const response = await apiClient.get<PropertiesListResponseDto>(
        "/api/v1/properties",
        { limit: 100 },
      );
      return (response.data.items ?? []).filter((item) => Boolean(item?.id)).map(mapPropertyDto);
    },
    staleTime: 10 * 60 * 1000,
  });
}
