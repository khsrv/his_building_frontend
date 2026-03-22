"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { createUnit } from "@/modules/properties/infrastructure/properties-repository";
import type { CreateUnitInput } from "@/modules/properties/domain/property";

export function useCreateUnitMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUnitInput) => createUnit(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unitsAll() });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
    },
  });
}
