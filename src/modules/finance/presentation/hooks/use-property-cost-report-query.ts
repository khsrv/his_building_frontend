"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchPropertyCostReport } from "@/modules/finance/infrastructure/finance-repository";

export function usePropertyCostReportQuery(propertyId?: string) {
  return useQuery({
    queryKey: financeKeys.propertyCostReport(propertyId),
    queryFn: () => fetchPropertyCostReport(propertyId ?? ""),
    enabled: Boolean(propertyId),
  });
}
