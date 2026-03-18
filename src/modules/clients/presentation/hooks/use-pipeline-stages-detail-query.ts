"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPipelineStagesDetail } from "@/modules/clients/infrastructure/clients-repository";
import { clientKeys } from "@/modules/clients/presentation/query-keys";

export function usePipelineStagesDetailQuery() {
  return useQuery({
    queryKey: clientKeys.pipelineStages(),
    queryFn: fetchPipelineStagesDetail,
  });
}
