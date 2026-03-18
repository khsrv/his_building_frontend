"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { createTransaction } from "@/modules/finance/infrastructure/finance-repository";
import type { CreateTransactionInput } from "@/modules/finance/domain/finance";

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => createTransaction(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
    },
  });
}
