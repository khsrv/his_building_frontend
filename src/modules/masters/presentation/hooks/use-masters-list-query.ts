"use client";

import { useQuery } from "@tanstack/react-query";
import { mastersKeys } from "@/modules/masters/presentation/query-keys";
import { fetchMastersList } from "@/modules/masters/infrastructure/masters-repository";
import type { MastersListParams } from "@/modules/masters/domain/master";

export function useMastersListQuery(params?: MastersListParams) {
  return useQuery({
    queryKey: mastersKeys.mastersList(params),
    queryFn: () => fetchMastersList(params),
  });
}
