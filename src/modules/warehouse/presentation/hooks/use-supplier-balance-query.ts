"use client";

import { useQuery } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { fetchSupplierBalance } from "@/modules/warehouse/infrastructure/warehouse-repository";

export function useSupplierBalanceQuery(supplierId: string) {
  return useQuery({
    queryKey: warehouseKeys.supplierBalance(supplierId),
    queryFn: () => fetchSupplierBalance(supplierId),
    enabled: Boolean(supplierId),
  });
}
