"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { createMaterial } from "@/modules/warehouse/infrastructure/warehouse-repository";
import type { CreateMaterialInput } from "@/modules/warehouse/domain/warehouse";

export function useCreateMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMaterialInput) => createMaterial(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warehouseKeys.materials() });
    },
  });
}
