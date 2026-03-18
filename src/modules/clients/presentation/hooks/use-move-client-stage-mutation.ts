"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { moveClientStage } from "@/modules/clients/infrastructure/clients-repository";
import type { PipelineBoardStage, PipelineBoardParams } from "@/modules/clients/domain/client";

interface MoveClientStageInput {
  clientId: string;
  stageId: string;
}

export function useMoveClientStageMutation(boardParams?: PipelineBoardParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, stageId }: MoveClientStageInput) =>
      moveClientStage(clientId, stageId),

    // Optimistic update
    onMutate: async ({ clientId, stageId }) => {
      const queryKey = clientKeys.pipelineBoard(boardParams);

      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previous = queryClient.getQueryData<PipelineBoardStage[]>(queryKey);

      // Optimistically update board
      queryClient.setQueryData<PipelineBoardStage[]>(queryKey, (old) => {
        if (!old) return old;

        // Find the client across all stages
        let movedClient: (typeof old)[number]["clients"][number] | undefined;
        const withoutClient = old.map((stage) => {
          const found = stage.clients.find((c) => c.id === clientId);
          if (found) {
            movedClient = found;
            return { ...stage, clients: stage.clients.filter((c) => c.id !== clientId) };
          }
          return stage;
        });

        if (!movedClient) return old;

        const updatedClient = { ...movedClient, pipelineStageId: stageId };

        return withoutClient.map((stage) => {
          if (stage.id === stageId) {
            return { ...stage, clients: [...stage.clients, updatedClient] };
          }
          return stage;
        });
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(clientKeys.pipelineBoard(boardParams), context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.pipelineBoard(boardParams) });
      void queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
