"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseItems, normalizeApiKeys } from "@/shared/lib/http/api-response";
import type { UpcomingPaymentDto, UpcomingPaymentsResponseDto } from "@/modules/payments/infrastructure/dto";
import { mapUpcomingPaymentDto } from "@/modules/payments/infrastructure/mappers";
import { paymentsQueryKeys } from "@/modules/payments/presentation/query-keys";

export interface UpcomingPaymentsParams {
  month: number;
  year: number;
  propertyId?: string | undefined;
  status?: string | undefined;
}

export function useUpcomingPaymentsQuery(params: UpcomingPaymentsParams) {
  return useQuery({
    queryKey: paymentsQueryKeys.upcoming(params),
    queryFn: async () => {
      const query: Record<string, string | number> = {
        month: params.month,
        year: params.year,
      };

      if (params.propertyId) {
        query["property_id"] = params.propertyId;
      }

      if (params.status) {
        query["status"] = params.status;
      }

      const response = await apiClient.get<UpcomingPaymentsResponseDto>(
        "/api/v1/schedule/upcoming",
        query,
      );
      const items = getResponseItems<UpcomingPaymentDto>(normalizeApiKeys(response));
      return items.filter((item) => Boolean(item?.id)).map(mapUpcomingPaymentDto);
    },
    staleTime: 2 * 60 * 1000,
  });
}
