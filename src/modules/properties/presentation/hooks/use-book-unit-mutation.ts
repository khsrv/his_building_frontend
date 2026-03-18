"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { updateUnitStatus } from "@/modules/properties/infrastructure/properties-repository";

export function useBookUnitMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => updateUnitStatus(unitId, "book"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboard(propertyId) });
    },
  });
}
