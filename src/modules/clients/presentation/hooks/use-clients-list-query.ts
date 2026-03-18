"use client";

import { useQuery } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { fetchClientsList } from "@/modules/clients/infrastructure/clients-repository";
import type { ClientsListParams } from "@/modules/clients/domain/client";

export function useClientsListQuery(params?: ClientsListParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => fetchClientsList(params),
  });
}
