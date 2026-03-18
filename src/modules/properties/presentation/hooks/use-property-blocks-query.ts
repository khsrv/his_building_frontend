"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { fetchPropertyBlocks } from "@/modules/properties/infrastructure/properties-repository";

export function usePropertyBlocksQuery(propertyId: string) {
  return useQuery({
    queryKey: propertyKeys.blocks(propertyId),
    queryFn: () => fetchPropertyBlocks(propertyId),
    enabled: Boolean(propertyId),
  });
}
