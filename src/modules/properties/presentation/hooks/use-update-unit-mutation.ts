"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { updateUnit } from "@/modules/properties/infrastructure/properties-repository";
import type { UpdateUnitInput } from "@/modules/properties/domain/property";

export function useUpdateUnitMutation(unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUnitInput) => updateUnit(unitId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unitsAll() });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unit(unitId) });
    },
  });
}
