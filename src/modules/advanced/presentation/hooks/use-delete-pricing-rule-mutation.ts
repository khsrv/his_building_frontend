"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePricingRule } from "@/modules/advanced/infrastructure/advanced-repository";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";

export function useDeletePricingRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePricingRule(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: advancedKeys.all });
    },
  });
}
