"use client";

import { useQuery } from "@tanstack/react-query";
import { landKeys } from "@/modules/land/presentation/land-query-keys";
import { fetchLandPlot } from "@/modules/land/infrastructure/land-repository";

export function useLandPlotDetailQuery(id: string) {
  return useQuery({
    queryKey: landKeys.plotDetail(id),
    queryFn: () => fetchLandPlot(id),
    enabled: !!id,
  });
}
