"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBroker } from "@/modules/advanced/infrastructure/advanced-repository";
import type { CreateBrokerInput } from "@/modules/advanced/domain/advanced";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";

export function useCreateBrokerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBrokerInput) => createBroker(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: advancedKeys.brokers() });
    },
  });
}
