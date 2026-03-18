"use client";

import { useQuery } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { fetchClientInteractions } from "@/modules/clients/infrastructure/clients-repository";

export function useClientInteractionsQuery(clientId: string) {
  return useQuery({
    queryKey: clientKeys.interactions(clientId),
    queryFn: () => fetchClientInteractions(clientId),
    enabled: Boolean(clientId),
  });
}
