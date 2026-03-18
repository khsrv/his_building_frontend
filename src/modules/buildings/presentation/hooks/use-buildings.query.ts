"use client";

import { useQuery } from "@tanstack/react-query";
import { listBuildings } from "@/modules/buildings/infrastructure/repository";
import { buildingsQueryKeys } from "@/modules/buildings/presentation/query-keys";

export function useBuildingsQuery() {
  return useQuery({
    queryKey: buildingsQueryKeys.list(),
    queryFn: listBuildings,
  });
}
