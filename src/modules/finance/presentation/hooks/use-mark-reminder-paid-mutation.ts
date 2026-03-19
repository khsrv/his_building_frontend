"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { markPayableReminderPaid } from "@/modules/finance/infrastructure/finance-repository";

export function useMarkReminderPaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; amount: number }) => markPayableReminderPaid(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.payableReminders() });
    },
  });
}
