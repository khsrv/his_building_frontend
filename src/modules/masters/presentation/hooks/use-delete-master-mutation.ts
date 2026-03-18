"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mastersKeys } from "@/modules/masters/presentation/query-keys";
import { deleteMaster } from "@/modules/masters/infrastructure/masters-repository";

export function useDeleteMasterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMaster(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mastersKeys.masters() });
    },
  });
}
