"use client";

import { useQuery } from "@tanstack/react-query";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";
import { fetchPricingRules } from "@/modules/advanced/infrastructure/advanced-repository";

export function usePricingRulesQuery(propertyId?: string) {
  return useQuery({
    queryKey: advancedKeys.pricingRules(propertyId),
    queryFn: () => fetchPricingRules(propertyId ?? ""),
    enabled: !!propertyId,
  });
}
