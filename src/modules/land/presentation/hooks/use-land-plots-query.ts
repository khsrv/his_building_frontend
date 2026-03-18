"use client";

import { useQuery } from "@tanstack/react-query";
import { landKeys } from "@/modules/land/presentation/land-query-keys";
import { fetchLandPlots } from "@/modules/land/infrastructure/land-repository";

export function useLandPlotsQuery(propertyId?: string) {
  return useQuery({
    queryKey: landKeys.plotsList(propertyId),
    queryFn: () => fetchLandPlots(propertyId),
  });
}
