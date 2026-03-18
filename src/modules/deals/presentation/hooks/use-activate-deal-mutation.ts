"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { activateDeal } from "@/modules/deals/infrastructure/repository";

export function useActivateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateDeal(id),
    onSuccess: (deal) => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(deal.id) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
    },
  });
}
