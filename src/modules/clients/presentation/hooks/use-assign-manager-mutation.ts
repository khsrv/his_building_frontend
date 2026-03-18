"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignManager } from "@/modules/clients/infrastructure/clients-repository";
import { clientKeys } from "@/modules/clients/presentation/query-keys";

export function useAssignManagerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, managerId }: { clientId: string; managerId: string }) =>
      assignManager(clientId, managerId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
      void queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
