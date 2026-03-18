"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { fetchUnitsList } from "@/modules/properties/infrastructure/properties-repository";
import type { UnitsListParams } from "@/modules/properties/domain/property";

export function useUnitsListQuery(params: UnitsListParams = {}) {
  return useQuery({
    queryKey: propertyKeys.units(params),
    queryFn: () => fetchUnitsList(params),
  });
}
