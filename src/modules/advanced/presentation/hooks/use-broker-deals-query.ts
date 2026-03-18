"use client";

import { useQuery } from "@tanstack/react-query";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";
import { fetchBrokerDeals } from "@/modules/advanced/infrastructure/advanced-repository";

export function useBrokerDealsQuery(brokerId: string) {
  return useQuery({
    queryKey: advancedKeys.brokerDeals(brokerId),
    queryFn: () => fetchBrokerDeals(brokerId),
    enabled: !!brokerId,
  });
}
