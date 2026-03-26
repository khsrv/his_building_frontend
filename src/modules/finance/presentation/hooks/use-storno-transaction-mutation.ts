"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { stornoTransaction } from "@/modules/finance/infrastructure/finance-repository";
import type { StornoTransactionInput } from "@/modules/finance/domain/finance";

export function useStornoTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StornoTransactionInput }) =>
      stornoTransaction(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
    },
  });
}
