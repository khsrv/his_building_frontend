"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { depositKeys } from "@/modules/deposits/presentation/deposit-query-keys";
import { applyDeposit } from "@/modules/deposits/infrastructure/deposits-repository";
import type { ApplyDepositInput } from "@/modules/deposits/domain/deposit";

export function useApplyDepositMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApplyDepositInput }) =>
      applyDeposit(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: depositKeys.all });
    },
  });
}
