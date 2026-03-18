"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { createClient } from "@/modules/clients/infrastructure/clients-repository";
import type { CreateClientInput } from "@/modules/clients/domain/client";

export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
