"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";
import { createSmsTemplate } from "@/modules/contracts/infrastructure/contracts-repository";
import type { CreateSmsTemplateInput } from "@/modules/contracts/domain/contract";

export function useCreateSmsTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSmsTemplateInput) => createSmsTemplate(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKeys.smsTemplates() });
    },
  });
}
