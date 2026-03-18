"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { addClientInteraction } from "@/modules/clients/infrastructure/clients-repository";
import type { AddInteractionInput } from "@/modules/clients/domain/client";

export function useAddInteractionMutation(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddInteractionInput) => addClientInteraction(clientId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.interactions(clientId) });
    },
  });
}
