"use client";

import { useQuery } from "@tanstack/react-query";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";
import { fetchBrokers } from "@/modules/advanced/infrastructure/advanced-repository";

export function useBrokersQuery() {
  return useQuery({
    queryKey: advancedKeys.brokers(),
    queryFn: fetchBrokers,
  });
}
