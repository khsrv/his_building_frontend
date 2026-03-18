"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchIncomeExpenseReport } from "@/modules/finance/infrastructure/finance-repository";
import type { IncomeExpenseReportParams } from "@/modules/finance/domain/finance";

export function useIncomeExpenseReportQuery(params?: IncomeExpenseReportParams) {
  return useQuery({
    queryKey: financeKeys.incomeExpenseReport(params),
    queryFn: () => fetchIncomeExpenseReport(params),
  });
}
