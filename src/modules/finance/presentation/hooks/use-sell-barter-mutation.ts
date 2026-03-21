"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { sellBarterAsset } from "@/modules/finance/infrastructure/finance-repository";
import type { BarterSellInput } from "@/modules/finance/domain/finance";

export function useSellBarterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BarterSellInput) => sellBarterAsset(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
    },
  });
}
