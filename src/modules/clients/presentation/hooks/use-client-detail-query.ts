"use client";

import { useQuery } from "@tanstack/react-query";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { fetchClientDetail } from "@/modules/clients/infrastructure/clients-repository";

export function useClientDetailQuery(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClientDetail(id),
    enabled: Boolean(id),
  });
}
