"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { updateUnitStatus } from "@/modules/properties/infrastructure/properties-repository";

export interface BookUnitInput {
  unitId: string;
  clientId?: string | undefined;
  comment?: string | undefined;
}

export function useBookUnitMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookUnitInput) =>
      updateUnitStatus(input.unitId, "book", {
        clientId: input.clientId,
        comment: input.comment,
      }),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unit(input.unitId) });
    },
  });
}
