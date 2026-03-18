"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPipelineStage } from "@/modules/clients/infrastructure/clients-repository";
import type { CreatePipelineStageInput } from "@/modules/clients/infrastructure/clients-repository";
import { clientKeys } from "@/modules/clients/presentation/query-keys";

export function useCreatePipelineStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePipelineStageInput) => createPipelineStage(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.pipelineStages() });
    },
  });
}
