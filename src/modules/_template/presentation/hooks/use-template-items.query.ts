"use client";

import { useQuery } from "@tanstack/react-query";
import { listTemplateItems } from "@/modules/_template/infrastructure/repository";
import { templateQueryKeys } from "@/modules/_template/presentation/query-keys";

export function useTemplateItemsQuery() {
  return useQuery({
    queryKey: templateQueryKeys.list(),
    queryFn: listTemplateItems,
  });
}
