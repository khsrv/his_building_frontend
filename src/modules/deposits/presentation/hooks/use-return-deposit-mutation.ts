"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { depositKeys } from "@/modules/deposits/presentation/deposit-query-keys";
import { returnDeposit } from "@/modules/deposits/infrastructure/deposits-repository";
import type { ReturnDepositInput } from "@/modules/deposits/domain/deposit";

export function useReturnDepositMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: ReturnDepositInput }) =>
      returnDeposit(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: depositKeys.all });
    },
  });
}
