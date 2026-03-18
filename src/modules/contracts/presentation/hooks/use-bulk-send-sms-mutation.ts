"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkSendSms } from "@/modules/contracts/infrastructure/contracts-repository";
import type { BulkSendSmsInput } from "@/modules/contracts/domain/contract";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";

export function useBulkSendSmsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkSendSmsInput) => bulkSendSms(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKeys.smsLogs() });
    },
  });
}
