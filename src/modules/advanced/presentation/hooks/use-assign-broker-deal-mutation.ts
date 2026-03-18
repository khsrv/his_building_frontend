"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignBrokerDeal } from "@/modules/advanced/infrastructure/advanced-repository";
import type { AssignBrokerDealInput } from "@/modules/advanced/domain/advanced";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";

export function useAssignBrokerDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignBrokerDealInput) => assignBrokerDeal(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: advancedKeys.brokerDeals(variables.brokerId) });
    },
  });
}
