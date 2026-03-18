"use client";

import { useQuery } from "@tanstack/react-query";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";
import { fetchInvoices } from "@/modules/advanced/infrastructure/advanced-repository";

export function useInvoicesQuery(status?: string) {
  return useQuery({
    queryKey: advancedKeys.invoices(status),
    queryFn: () => fetchInvoices(status),
  });
}
