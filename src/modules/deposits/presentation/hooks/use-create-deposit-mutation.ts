"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { depositKeys } from "@/modules/deposits/presentation/deposit-query-keys";
import { createDeposit } from "@/modules/deposits/infrastructure/deposits-repository";
import type { CreateDepositInput } from "@/modules/deposits/domain/deposit";

export function useCreateDepositMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDepositInput) => createDeposit(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: depositKeys.all });
    },
  });
}
