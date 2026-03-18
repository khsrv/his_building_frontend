"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchTransactions } from "@/modules/finance/infrastructure/finance-repository";
import type { TransactionListParams } from "@/modules/finance/domain/finance";

export function useTransactionsQuery(params?: TransactionListParams) {
  return useQuery({
    queryKey: financeKeys.transactionList(params),
    queryFn: () => fetchTransactions(params),
  });
}
