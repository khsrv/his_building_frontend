"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { deleteUnit } from "@/modules/properties/infrastructure/properties-repository";

export function useDeleteUnitMutation(propertyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unitsAll() });
      if (propertyId) {
        void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboard(propertyId) });
      }
    },
  });
}
