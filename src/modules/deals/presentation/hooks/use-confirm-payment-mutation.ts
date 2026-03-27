"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmPayment } from "@/modules/deals/infrastructure/repository";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useConfirmPaymentMutation(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => confirmPayment(paymentId),
    onSuccess: () => {
      // Deal-level invalidation
      void queryClient.invalidateQueries({ queryKey: dealKeys.payments(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.schedule(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
      // #11 fix: finance and dashboard must reflect confirmed payment immediately
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      void queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}
