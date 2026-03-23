"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { updateUnitStatus } from "@/modules/properties/infrastructure/properties-repository";

export function useReleaseUnitMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => updateUnitStatus(unitId, "release"),
    onSuccess: (_data, unitId) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unit(unitId) });
    },
  });
}
