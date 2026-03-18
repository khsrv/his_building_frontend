"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { createSupplierPayment } from "@/modules/warehouse/infrastructure/warehouse-repository";
import type { CreateSupplierPaymentInput } from "@/modules/warehouse/domain/warehouse";

export function useCreateSupplierPaymentMutation(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSupplierPaymentInput) =>
      createSupplierPayment(supplierId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: warehouseKeys.supplierPayments(supplierId),
      });
      void queryClient.invalidateQueries({
        queryKey: warehouseKeys.supplierBalance(supplierId),
      });
    },
  });
}
