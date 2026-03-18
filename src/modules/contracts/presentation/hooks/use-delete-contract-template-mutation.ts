"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";
import { deleteContractTemplate } from "@/modules/contracts/infrastructure/contracts-repository";

export function useDeleteContractTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContractTemplate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKeys.templates() });
    },
  });
}
