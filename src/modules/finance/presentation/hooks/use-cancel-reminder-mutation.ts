"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { cancelPayableReminder } from "@/modules/finance/infrastructure/finance-repository";

export function useCancelReminderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelPayableReminder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.payableReminders() });
    },
  });
}
