"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePipelineStage } from "@/modules/clients/infrastructure/clients-repository";
import type { UpdatePipelineStageInput } from "@/modules/clients/infrastructure/clients-repository";
import { clientKeys } from "@/modules/clients/presentation/query-keys";

export function useUpdatePipelineStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePipelineStageInput }) =>
      updatePipelineStage(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.pipelineStages() });
    },
  });
}
