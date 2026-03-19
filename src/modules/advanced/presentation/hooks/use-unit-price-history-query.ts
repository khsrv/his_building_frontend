"use client";

import { useQuery } from "@tanstack/react-query";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";
import { fetchUnitPriceHistory } from "@/modules/advanced/infrastructure/advanced-repository";

export function useUnitPriceHistoryQuery(unitId?: string) {
  return useQuery({
    queryKey: advancedKeys.unitPriceHistory(unitId),
    queryFn: () => fetchUnitPriceHistory(unitId ?? ""),
    enabled: Boolean(unitId),
  });
}
