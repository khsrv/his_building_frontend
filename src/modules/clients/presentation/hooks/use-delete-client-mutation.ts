"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { deleteClient } from "@/modules/clients/infrastructure/clients-repository";

export function useDeleteClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
