"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { receivePayment } from "@/modules/deals/infrastructure/repository";
import type { ReceivePaymentInput } from "@/modules/deals/domain/deal";

export function useReceivePaymentMutation(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReceivePaymentInput) => receivePayment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.schedule(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.payments(dealId) });
    },
  });
}
