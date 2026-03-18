"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { fetchDealDetail } from "@/modules/deals/infrastructure/repository";

export function useDealDetailQuery(id: string) {
  return useQuery({
    queryKey: dealKeys.detail(id),
    queryFn: () => fetchDealDetail(id),
    enabled: Boolean(id),
  });
}
