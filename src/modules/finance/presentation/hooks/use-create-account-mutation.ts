"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { createAccount } from "@/modules/finance/infrastructure/finance-repository";
import type { CreateAccountInput } from "@/modules/finance/domain/finance";

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAccountInput) => createAccount(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
    },
  });
}
