"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCurrency } from "@/modules/finance/infrastructure/finance-repository";
import type { CreateCurrencyInput } from "@/modules/finance/domain/finance";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useCreateCurrencyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCurrencyInput) => createCurrency(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.currencies() });
    },
  });
}
