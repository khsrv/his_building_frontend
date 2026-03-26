"use client";

import { useMemo } from "react";
import { useCurrenciesQuery } from "@/modules/finance/presentation/hooks/use-currencies-query";

export interface CurrencyOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Returns select-ready currency options from the tenant's configured currencies.
 * Replaces all hardcoded CURRENCY_OPTIONS arrays.
 */
export function useCurrencyOptions(): readonly CurrencyOption[] {
  const { data: currencies } = useCurrenciesQuery();

  return useMemo(() => {
    if (!currencies || currencies.length === 0) {
      return [{ value: "USD", label: "USD" }];
    }
    return currencies.map((c) => ({
      value: c.code,
      label: c.symbol ? `${c.code} (${c.symbol})` : c.code,
    }));
  }, [currencies]);
}
