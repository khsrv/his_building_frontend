"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrencies } from "@/modules/finance/infrastructure/finance-repository";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useCurrenciesQuery() {
  return useQuery({
    queryKey: financeKeys.currencies(),
    queryFn: fetchCurrencies,
  });
}
