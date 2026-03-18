"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpenseCategory } from "@/modules/finance/infrastructure/finance-repository";
import type { CreateExpenseCategoryInput } from "@/modules/finance/domain/finance";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useCreateExpenseCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseCategoryInput) => createExpenseCategory(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.expenseCategories() });
    },
  });
}
