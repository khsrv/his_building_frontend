"use client";

import { useQuery } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { fetchSupplierPayments } from "@/modules/warehouse/infrastructure/warehouse-repository";

export function useSupplierPaymentsQuery(supplierId: string) {
  return useQuery({
    queryKey: warehouseKeys.supplierPayments(supplierId),
    queryFn: () => fetchSupplierPayments(supplierId),
    enabled: Boolean(supplierId),
  });
}
