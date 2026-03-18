"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { cancelDeal } from "@/modules/deals/infrastructure/repository";

export function useCancelDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelDeal(id),
    onSuccess: (deal) => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(deal.id) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
    },
  });
}
