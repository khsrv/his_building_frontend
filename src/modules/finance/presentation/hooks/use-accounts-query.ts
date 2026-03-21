"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchAccounts } from "@/modules/finance/infrastructure/finance-repository";

export function useAccountsQuery(propertyId?: string) {
  const params = propertyId ? { propertyId } : undefined;
  return useQuery({
    queryKey: financeKeys.accounts(params),
    queryFn: () => fetchAccounts(params),
  });
}
