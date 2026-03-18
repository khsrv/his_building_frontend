"use client";

import { useQuery } from "@tanstack/react-query";
import { listLand } from "@/modules/land/infrastructure/repository";
import { landQueryKeys } from "@/modules/land/presentation/query-keys";

export function useLandQuery() {
  return useQuery({
    queryKey: landQueryKeys.list(),
    queryFn: listLand,
  });
}
