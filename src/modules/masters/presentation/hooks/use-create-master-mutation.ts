"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mastersKeys } from "@/modules/masters/presentation/query-keys";
import { createMaster } from "@/modules/masters/infrastructure/masters-repository";
import type { CreateMasterInput } from "@/modules/masters/domain/master";

export function useCreateMasterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMasterInput) => createMaster(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mastersKeys.masters() });
    },
  });
}
