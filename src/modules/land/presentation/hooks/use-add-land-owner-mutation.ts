"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addLandOwner } from "@/modules/land/infrastructure/land-repository";
import type { CreateLandOwnerInput } from "@/modules/land/domain/land";
import { landKeys } from "@/modules/land/presentation/land-query-keys";

export function useAddLandOwnerMutation(plotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLandOwnerInput) => addLandOwner(plotId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: landKeys.owners(plotId) });
    },
  });
}
