"use client";

import { useMutation } from "@tanstack/react-query";
import { generateContract } from "@/modules/contracts/infrastructure/contracts-repository";

export function useGenerateContractMutation() {
  return useMutation({
    mutationFn: ({ dealId, templateId }: { dealId: string; templateId?: string }) =>
      generateContract(dealId, templateId),
  });
}
