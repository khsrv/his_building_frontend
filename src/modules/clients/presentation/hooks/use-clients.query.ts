"use client";

import { useQuery } from "@tanstack/react-query";
import { listClients } from "@/modules/clients/infrastructure/repository";
import { clientsQueryKeys } from "@/modules/clients/presentation/query-keys";

export function useClientsQuery() {
  return useQuery({
    queryKey: clientsQueryKeys.list(),
    queryFn: listClients,
  });
}
