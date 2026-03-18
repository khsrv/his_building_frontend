"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { fetchDealPayments } from "@/modules/deals/infrastructure/repository";

export function useDealPaymentsQuery(dealId: string) {
  return useQuery({
    queryKey: dealKeys.payments(dealId),
    queryFn: () => fetchDealPayments(dealId),
    enabled: Boolean(dealId),
  });
}
