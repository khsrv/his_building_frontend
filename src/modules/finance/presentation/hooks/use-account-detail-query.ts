"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAccountDetail } from "@/modules/finance/infrastructure/finance-repository";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useAccountDetailQuery(id: string) {
  return useQuery({
    queryKey: financeKeys.accountDetail(id),
    queryFn: () => fetchAccountDetail(id),
    enabled: id.length > 0,
  });
}
