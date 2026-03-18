"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { fetchDealsList } from "@/modules/deals/infrastructure/repository";
import type { DealsListParams } from "@/modules/deals/domain/deal";

export function useDealsListQuery(params?: DealsListParams, enabled = true) {
  return useQuery({
    queryKey: dealKeys.list(params),
    queryFn: () => fetchDealsList(params),
    enabled,
  });
}
