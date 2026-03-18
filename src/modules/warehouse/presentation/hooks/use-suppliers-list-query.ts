"use client";

import { useQuery } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { fetchSuppliersList } from "@/modules/warehouse/infrastructure/warehouse-repository";
import type { SuppliersListParams } from "@/modules/warehouse/domain/warehouse";

export function useSuppliersListQuery(params?: SuppliersListParams) {
  return useQuery({
    queryKey: warehouseKeys.suppliersList(params),
    queryFn: () => fetchSuppliersList(params),
  });
}
