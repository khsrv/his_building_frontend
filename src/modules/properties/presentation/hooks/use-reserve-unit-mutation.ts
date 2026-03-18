"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { updateUnitStatus } from "@/modules/properties/infrastructure/properties-repository";

export function useReserveUnitMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => updateUnitStatus(unitId, "reserve"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboard(propertyId) });
    },
  });
}
