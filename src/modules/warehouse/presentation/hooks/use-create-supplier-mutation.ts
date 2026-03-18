"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { createSupplier } from "@/modules/warehouse/infrastructure/warehouse-repository";
import type { CreateSupplierInput } from "@/modules/warehouse/domain/warehouse";

export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSupplierInput) => createSupplier(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warehouseKeys.suppliers() });
    },
  });
}
