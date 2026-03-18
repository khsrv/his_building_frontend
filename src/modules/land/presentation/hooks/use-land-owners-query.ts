"use client";

import { useQuery } from "@tanstack/react-query";
import { landKeys } from "@/modules/land/presentation/land-query-keys";
import { fetchLandOwners } from "@/modules/land/infrastructure/land-repository";

export function useLandOwnersQuery(plotId: string) {
  return useQuery({
    queryKey: landKeys.owners(plotId),
    queryFn: () => fetchLandOwners(plotId),
    enabled: !!plotId,
  });
}
