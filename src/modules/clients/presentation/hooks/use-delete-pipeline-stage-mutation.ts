"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePipelineStage } from "@/modules/clients/infrastructure/clients-repository";
import { clientKeys } from "@/modules/clients/presentation/query-keys";

export function useDeletePipelineStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePipelineStage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.pipelineStages() });
    },
  });
}
