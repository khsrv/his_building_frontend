"use client";

import { useQuery } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { fetchSupplierStatement } from "@/modules/warehouse/infrastructure/warehouse-repository";

export function useSupplierStatementQuery(supplierId: string) {
  return useQuery({
    queryKey: warehouseKeys.supplierStatement(supplierId),
    queryFn: () => fetchSupplierStatement(supplierId),
    enabled: Boolean(supplierId),
  });
}
