"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { updateUnitStatus } from "@/modules/properties/infrastructure/properties-repository";

export interface ReserveUnitInput {
  unitId: string;
  clientId?: string | undefined;
  comment?: string | undefined;
}

export function useReserveUnitMutation(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReserveUnitInput) =>
      updateUnitStatus(input.unitId, "reserve", {
        clientId: input.clientId,
        comment: input.comment,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
    },
  });
}
