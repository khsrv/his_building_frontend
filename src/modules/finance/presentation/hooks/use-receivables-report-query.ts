"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchReceivablesReport } from "@/modules/finance/infrastructure/finance-repository";

export function useReceivablesReportQuery(propertyId?: string) {
  return useQuery({
    queryKey: financeKeys.receivablesReport(propertyId),
    queryFn: () => fetchReceivablesReport(propertyId ? { propertyId } : undefined),
  });
}
