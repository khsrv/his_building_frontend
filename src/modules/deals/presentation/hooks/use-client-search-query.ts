"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { searchClients } from "@/modules/deals/infrastructure/repository";

export function useClientSearchQuery(search: string) {
  return useQuery({
    queryKey: dealKeys.clientSearch(search),
    queryFn: () => searchClients(search),
    enabled: search.length >= 2,
    staleTime: 30_000,
  });
}
