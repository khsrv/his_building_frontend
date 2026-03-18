"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { createStockMovement } from "@/modules/warehouse/infrastructure/warehouse-repository";
import type { CreateStockMovementInput } from "@/modules/warehouse/domain/warehouse";

export function useCreateStockMovementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStockMovementInput) => createStockMovement(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: warehouseKeys.stockMovements(),
      });
      // Also invalidate materials since stock changes
      void queryClient.invalidateQueries({ queryKey: warehouseKeys.materials() });
    },
  });
}
