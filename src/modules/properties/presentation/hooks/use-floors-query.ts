"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { fetchFloors } from "@/modules/properties/infrastructure/properties-repository";

export function useFloorsQuery(propertyId: string, blockId: string) {
  return useQuery({
    queryKey: propertyKeys.floors(propertyId, blockId),
    queryFn: () => fetchFloors(propertyId, blockId),
    enabled: Boolean(propertyId) && Boolean(blockId),
  });
}
