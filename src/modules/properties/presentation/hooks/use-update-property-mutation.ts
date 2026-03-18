"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { updateProperty } from "@/modules/properties/infrastructure/properties-repository";
import type { UpdatePropertyInput } from "@/modules/properties/domain/property";

export function useUpdatePropertyMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePropertyInput) => updateProperty(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
    },
  });
}
