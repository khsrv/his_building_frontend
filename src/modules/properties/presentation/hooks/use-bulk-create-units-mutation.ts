"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { bulkCreateUnits } from "@/modules/properties/infrastructure/properties-repository";
import type { BulkCreateUnitsInput } from "@/modules/properties/domain/property";

export function useBulkCreateUnitsMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkCreateUnitsInput) => bulkCreateUnits(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unitsAll() });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
    },
  });
}
