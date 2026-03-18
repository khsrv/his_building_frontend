"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";
import { sendSms } from "@/modules/contracts/infrastructure/contracts-repository";
import type { SendSmsInput } from "@/modules/contracts/domain/contract";

export function useSendSmsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendSmsInput) => sendSms(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKeys.smsLogs() });
    },
  });
}
