"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";
import { createContractTemplate } from "@/modules/contracts/infrastructure/contracts-repository";
import type { CreateContractTemplateInput } from "@/modules/contracts/domain/contract";

export function useCreateContractTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContractTemplateInput) => createContractTemplate(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKeys.templates() });
    },
  });
}
