"use client";

import { useQuery } from "@tanstack/react-query";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";
import { listContractTemplates } from "@/modules/contracts/infrastructure/contracts-repository";

export function useContractTemplatesQuery() {
  return useQuery({
    queryKey: contractsQueryKeys.templates(),
    queryFn: listContractTemplates,
  });
}
