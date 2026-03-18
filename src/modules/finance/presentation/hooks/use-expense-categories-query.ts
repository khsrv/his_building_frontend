"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchExpenseCategories } from "@/modules/finance/infrastructure/finance-repository";

export function useExpenseCategoriesQuery() {
  return useQuery({
    queryKey: financeKeys.expenseCategories(),
    queryFn: fetchExpenseCategories,
  });
}
