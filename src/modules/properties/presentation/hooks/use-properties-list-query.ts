"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { fetchPropertiesList } from "@/modules/properties/infrastructure/properties-repository";
import type { PropertiesListParams } from "@/modules/properties/domain/property";

export function usePropertiesListQuery(params: PropertiesListParams = {}) {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: () => fetchPropertiesList(params),
  });
}
