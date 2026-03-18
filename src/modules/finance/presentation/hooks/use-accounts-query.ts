"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchAccounts } from "@/modules/finance/infrastructure/finance-repository";

export function useAccountsQuery() {
  return useQuery({
    queryKey: financeKeys.accounts(),
    queryFn: fetchAccounts,
  });
}
