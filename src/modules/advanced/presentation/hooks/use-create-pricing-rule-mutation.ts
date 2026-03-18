"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPricingRule } from "@/modules/advanced/infrastructure/advanced-repository";
import type { CreatePricingRuleInput } from "@/modules/advanced/domain/advanced";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";

export function useCreatePricingRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePricingRuleInput) => createPricingRule(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: advancedKeys.pricingRules(variables.propertyId) });
    },
  });
}
