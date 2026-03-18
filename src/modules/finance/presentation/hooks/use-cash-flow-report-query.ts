"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchCashFlowReport } from "@/modules/finance/infrastructure/finance-repository";
import type { CashFlowReportParams } from "@/modules/finance/domain/finance";

export function useCashFlowReportQuery(params?: CashFlowReportParams) {
  return useQuery({
    queryKey: financeKeys.cashFlowReport(params),
    queryFn: () => fetchCashFlowReport(params),
  });
}
