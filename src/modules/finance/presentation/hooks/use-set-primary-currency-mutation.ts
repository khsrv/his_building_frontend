"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setPrimaryCurrency } from "@/modules/finance/infrastructure/finance-repository";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useSetPrimaryCurrencyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setPrimaryCurrency(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.currencies() });
    },
  });
}
