"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { fetchDealSchedule } from "@/modules/deals/infrastructure/repository";

export function useDealScheduleQuery(dealId: string) {
  return useQuery({
    queryKey: dealKeys.schedule(dealId),
    queryFn: () => fetchDealSchedule(dealId),
    enabled: Boolean(dealId),
  });
}
