"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBroker } from "@/modules/advanced/infrastructure/advanced-repository";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";

export function useDeleteBrokerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBroker(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: advancedKeys.brokers() });
    },
  });
}
