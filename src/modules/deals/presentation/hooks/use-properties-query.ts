"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { fetchPropertiesMinimal } from "@/modules/deals/infrastructure/repository";

export function usePropertiesQuery() {
  return useQuery({
    queryKey: dealKeys.properties(),
    queryFn: fetchPropertiesMinimal,
    staleTime: 5 * 60_000,
  });
}
