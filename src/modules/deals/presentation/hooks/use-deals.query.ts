"use client";

import { useQuery } from "@tanstack/react-query";
import { listDeals } from "@/modules/deals/infrastructure/repository";
import { dealsQueryKeys } from "@/modules/deals/presentation/query-keys";

export function useDealsQuery() {
  return useQuery({
    queryKey: dealsQueryKeys.list(),
    queryFn: listDeals,
  });
}
