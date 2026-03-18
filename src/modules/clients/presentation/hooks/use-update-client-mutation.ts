"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { updateClient } from "@/modules/clients/infrastructure/clients-repository";
import type { UpdateClientInput } from "@/modules/clients/domain/client";

export function useUpdateClientMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateClientInput) => updateClient(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
    },
  });
}
