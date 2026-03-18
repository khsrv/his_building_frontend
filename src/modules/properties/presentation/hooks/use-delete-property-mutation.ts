"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { deleteProperty } from "@/modules/properties/infrastructure/properties-repository";

export function useDeletePropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
}
