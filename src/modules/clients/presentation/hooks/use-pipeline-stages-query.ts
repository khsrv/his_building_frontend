"use client";

import { useQuery } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { fetchPipelineStages } from "@/modules/clients/infrastructure/clients-repository";

export function usePipelineStagesQuery() {
  return useQuery({
    queryKey: clientKeys.pipelineStages(),
    queryFn: fetchPipelineStages,
  });
}
