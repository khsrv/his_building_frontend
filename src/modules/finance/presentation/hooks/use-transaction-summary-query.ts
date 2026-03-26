"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTransactionSummary } from "@/modules/finance/infrastructure/finance-repository";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import type { TransactionSummaryParams } from "@/modules/finance/domain/finance";

export function useTransactionSummaryQuery(params?: TransactionSummaryParams) {
  return useQuery({
    queryKey: financeKeys.transactionSummary(params),
    queryFn: () => fetchTransactionSummary(params),
  });
}
