"use client";

import { useQuery } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { fetchAllSupplierBalances } from "@/modules/warehouse/infrastructure/warehouse-repository";

export function useSupplierBalancesQuery() {
  return useQuery({
    queryKey: warehouseKeys.supplierBalances(),
    queryFn: fetchAllSupplierBalances,
  });
}
