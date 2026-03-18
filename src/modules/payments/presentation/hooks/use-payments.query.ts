"use client";

import { useQuery } from "@tanstack/react-query";
import { listPayments } from "@/modules/payments/infrastructure/repository";
import { paymentsQueryKeys } from "@/modules/payments/presentation/query-keys";

export function usePaymentsQuery() {
  return useQuery({
    queryKey: paymentsQueryKeys.list(),
    queryFn: listPayments,
  });
}
