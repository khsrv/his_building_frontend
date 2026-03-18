"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";
import { updateContractTemplate } from "@/modules/contracts/infrastructure/contracts-repository";
import type { UpdateContractTemplateInput } from "@/modules/contracts/domain/contract";

export function useUpdateContractTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContractTemplateInput }) =>
      updateContractTemplate(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKeys.templates() });
      void queryClient.invalidateQueries({
        queryKey: contractsQueryKeys.template(variables.id),
      });
    },
  });
}
