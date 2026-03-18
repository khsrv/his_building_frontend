"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { fetchAvailableUnits } from "@/modules/deals/infrastructure/repository";

export function useAvailableUnitsQuery(propertyId: string) {
  return useQuery({
    queryKey: dealKeys.units(propertyId),
    queryFn: () => fetchAvailableUnits(propertyId),
    enabled: Boolean(propertyId),
    staleTime: 60_000,
  });
}
