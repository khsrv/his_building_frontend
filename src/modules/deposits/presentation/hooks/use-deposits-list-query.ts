"use client";

import { useQuery } from "@tanstack/react-query";
import { depositKeys } from "@/modules/deposits/presentation/deposit-query-keys";
import { fetchDepositsList } from "@/modules/deposits/infrastructure/deposits-repository";
import type { DepositsListParams } from "@/modules/deposits/domain/deposit";

export function useDepositsListQuery(params?: DepositsListParams) {
  return useQuery({
    queryKey: depositKeys.list(params),
    queryFn: () => fetchDepositsList(params),
  });
}
