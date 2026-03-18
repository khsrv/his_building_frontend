"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { markPayableReminderPaid } from "@/modules/finance/infrastructure/finance-repository";

export function useMarkReminderPaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markPayableReminderPaid(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.payableReminders() });
    },
  });
}
