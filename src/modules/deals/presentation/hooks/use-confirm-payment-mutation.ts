"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmPayment } from "@/modules/deals/infrastructure/repository";
import { dealKeys } from "@/modules/deals/presentation/query-keys";

export function useConfirmPaymentMutation(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => confirmPayment(paymentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.payments(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.schedule(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
    },
  });
}
