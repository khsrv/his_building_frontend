"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchExchangeRates } from "@/modules/finance/infrastructure/finance-repository";
import type { ExchangeRateListParams } from "@/modules/finance/domain/finance";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";

export function useExchangeRatesQuery(params?: ExchangeRateListParams) {
  return useQuery({
    queryKey: financeKeys.exchangeRates(params),
    queryFn: () => fetchExchangeRates(params),
  });
}
