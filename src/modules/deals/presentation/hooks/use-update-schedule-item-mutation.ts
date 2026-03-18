"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateScheduleItem } from "@/modules/deals/infrastructure/repository";
import type { UpdateScheduleItemInput } from "@/modules/deals/infrastructure/repository";
import { dealKeys } from "@/modules/deals/presentation/query-keys";

export function useUpdateScheduleItemMutation(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateScheduleItemInput }) =>
      updateScheduleItem(dealId, itemId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.schedule(dealId) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
    },
  });
}
