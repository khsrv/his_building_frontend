"use client";

import { useQuery } from "@tanstack/react-query";
import { listFinance } from "@/modules/finance/infrastructure/repository";
import { financeQueryKeys } from "@/modules/finance/presentation/query-keys";

export function useFinanceQuery() {
  return useQuery({
    queryKey: financeQueryKeys.list(),
    queryFn: listFinance,
  });
}
