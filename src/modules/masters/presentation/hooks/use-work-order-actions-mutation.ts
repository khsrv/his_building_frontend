"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mastersKeys } from "@/modules/masters/presentation/query-keys";
import {
  startWorkOrder,
  completeWorkOrder,
  acceptWorkOrder,
} from "@/modules/masters/infrastructure/masters-repository";
import type { CompleteWorkOrderInput } from "@/modules/masters/domain/master";

export function useStartWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => startWorkOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mastersKeys.workOrders() });
    },
  });
}

export function useCompleteWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompleteWorkOrderInput }) =>
      completeWorkOrder(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mastersKeys.workOrders() });
    },
  });
}

export function useAcceptWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptWorkOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mastersKeys.workOrders() });
    },
  });
}
