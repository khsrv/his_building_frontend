"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { fetchPropertyDetail } from "@/modules/properties/infrastructure/properties-repository";

export function usePropertyDetailQuery(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => fetchPropertyDetail(id),
    enabled: Boolean(id),
  });
}
