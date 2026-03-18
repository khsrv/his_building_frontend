"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExchangeRate } from "@/modules/finance/infrastructure/finance-repository";
import type { CreateExchangeRateInput } from "@/modules/finance/domain/finance";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useCreateExchangeRateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExchangeRateInput) => createExchangeRate(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.exchangeRates() });
    },
  });
}
