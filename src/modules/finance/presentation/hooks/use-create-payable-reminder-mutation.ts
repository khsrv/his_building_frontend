"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { createPayableReminder } from "@/modules/finance/infrastructure/finance-repository";
import type { CreatePayableReminderInput } from "@/modules/finance/domain/finance";

export function useCreatePayableReminderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePayableReminderInput) => createPayableReminder(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.payableReminders() });
    },
  });
}
