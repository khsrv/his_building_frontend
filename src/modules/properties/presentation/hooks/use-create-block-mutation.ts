"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { createBlock } from "@/modules/properties/infrastructure/properties-repository";
import type { CreateBlockInput } from "@/modules/properties/domain/property";

export function useCreateBlockMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBlockInput) => createBlock(propertyId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.blocks(propertyId) });
    },
  });
}
