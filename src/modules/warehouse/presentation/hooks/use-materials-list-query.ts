"use client";

import { useQuery } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { fetchMaterialsList } from "@/modules/warehouse/infrastructure/warehouse-repository";
import type { MaterialsListParams } from "@/modules/warehouse/domain/warehouse";

export function useMaterialsListQuery(params?: MaterialsListParams) {
  return useQuery({
    queryKey: warehouseKeys.materialsList(params),
    queryFn: () => fetchMaterialsList(params),
  });
}
