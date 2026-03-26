"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { deleteTransaction } from "@/modules/finance/infrastructure/finance-repository";

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
    },
  });
}
