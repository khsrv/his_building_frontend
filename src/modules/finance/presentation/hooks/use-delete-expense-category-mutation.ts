"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExpenseCategory } from "@/modules/finance/infrastructure/finance-repository";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useDeleteExpenseCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpenseCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.expenseCategories() });
    },
  });
}
