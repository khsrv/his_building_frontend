"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { updateTransaction } from "@/modules/finance/infrastructure/finance-repository";
import type { UpdateTransactionInput } from "@/modules/finance/domain/finance";

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      updateTransaction(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
    },
  });
}
