"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { deleteFloor } from "@/modules/properties/infrastructure/properties-repository";

export function useDeleteFloorMutation(propertyId: string, blockId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (floorId: string) => deleteFloor(propertyId, blockId, floorId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(propertyId, blockId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.chessboardPrefix(propertyId) });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.unitsAll() });
    },
  });
}
