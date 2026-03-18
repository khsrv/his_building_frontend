"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mastersKeys } from "@/modules/masters/presentation/query-keys";
import { createWorkOrder } from "@/modules/masters/infrastructure/masters-repository";
import type { CreateWorkOrderInput } from "@/modules/masters/domain/master";

export function useCreateWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkOrderInput) => createWorkOrder(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mastersKeys.workOrders() });
    },
  });
}
