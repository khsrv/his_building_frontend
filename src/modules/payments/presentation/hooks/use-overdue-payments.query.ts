"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import type { OverduePaymentsResponseDto } from "@/modules/payments/infrastructure/dto";
import { mapOverduePaymentDto } from "@/modules/payments/infrastructure/mappers";
import { paymentsQueryKeys } from "@/modules/payments/presentation/query-keys";

export function useOverduePaymentsQuery() {
  return useQuery({
    queryKey: paymentsQueryKeys.overdue(),
    queryFn: async () => {
      const response = await apiClient.get<OverduePaymentsResponseDto>(
        "/api/v1/payments/overdue",
      );
      return response.data.items.map(mapOverduePaymentDto);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
