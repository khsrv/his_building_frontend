"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markInvoicePaid } from "@/modules/advanced/infrastructure/advanced-repository";
import { advancedKeys } from "@/modules/advanced/presentation/advanced-query-keys";

export function useMarkInvoicePaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markInvoicePaid(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: advancedKeys.all });
    },
  });
}
