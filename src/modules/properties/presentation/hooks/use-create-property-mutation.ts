"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { createProperty } from "@/modules/properties/infrastructure/properties-repository";
import type { CreatePropertyInput } from "@/modules/properties/domain/property";

export function useCreatePropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePropertyInput) => createProperty(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
}
