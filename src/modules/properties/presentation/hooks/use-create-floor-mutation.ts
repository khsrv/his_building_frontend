"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { createFloor } from "@/modules/properties/infrastructure/properties-repository";

export function useCreateFloorMutation(propertyId: string, blockId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (floorNumber: number) => createFloor(propertyId, blockId, floorNumber),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(propertyId, blockId) });
    },
  });
}
