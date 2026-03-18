"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { deleteBlock } from "@/modules/properties/infrastructure/properties-repository";

export function useDeleteBlockMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: string) => deleteBlock(propertyId, blockId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.blocks(propertyId) });
    },
  });
}
