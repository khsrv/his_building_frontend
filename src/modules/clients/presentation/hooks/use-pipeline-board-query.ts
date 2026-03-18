"use client";

import { useQuery } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { fetchPipelineBoard } from "@/modules/clients/infrastructure/clients-repository";
import type { PipelineBoardParams } from "@/modules/clients/domain/client";

export function usePipelineBoardQuery(params?: PipelineBoardParams) {
  return useQuery({
    queryKey: clientKeys.pipelineBoard(params),
    queryFn: () => fetchPipelineBoard(params),
  });
}
