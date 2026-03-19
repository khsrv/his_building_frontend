"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { deleteUnit } from "@/modules/properties/infrastructure/properties-repository";

export function useDeleteUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unitsAll() });
    },
  });
}
