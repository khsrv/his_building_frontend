"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { receivePayment } from "@/modules/deals/infrastructure/repository";
import type { ReceivePaymentInput } from "@/modules/deals/domain/deal";
import { dashboardKeys } from "@/modules/dashboard/presentation/query-keys";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useReceivePaymentMutation(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReceivePaymentInput) =>
      receivePayment({ ...input, idempotencyKey: input.idempotencyKey ?? crypto.randomUUID() }),
    onSuccess: () => {
      // Deal-level invalidation
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.schedule(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.payments(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      // #11 fix: dashboard and finance must reflect new payment immediately
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      void queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}
