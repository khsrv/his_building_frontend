"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { deleteMaterial } from "@/modules/warehouse/infrastructure/warehouse-repository";

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warehouseKeys.materials() });
    },
  });
}
