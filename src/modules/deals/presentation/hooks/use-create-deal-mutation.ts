"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { createDeal } from "@/modules/deals/infrastructure/repository";
import type { CreateDealInput } from "@/modules/deals/domain/deal";

export function useCreateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDealInput) => createDeal(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
    },
  });
}
