"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { cancelDeal } from "@/modules/deals/infrastructure/repository";
import type { CancelDealInput } from "@/modules/deals/domain/deal";

interface CancelDealParams {
  id: string;
  input?: CancelDealInput | undefined;
}

export function useCancelDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelDealParams) => cancelDeal(params.id, params.input),
    onSuccess: (deal) => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(deal.id) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
    },
  });
}
