"use client";

import { useQuery } from "@tanstack/react-query";
import { contractsQueryKeys } from "@/modules/contracts/presentation/contracts-query-keys";
import { listSmsTemplates } from "@/modules/contracts/infrastructure/contracts-repository";

export function useSmsTemplatesQuery() {
  return useQuery({
    queryKey: contractsQueryKeys.smsTemplates(),
    queryFn: listSmsTemplates,
  });
}
