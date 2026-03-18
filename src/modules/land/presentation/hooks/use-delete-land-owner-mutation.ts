"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLandOwner } from "@/modules/land/infrastructure/land-repository";
import { landKeys } from "@/modules/land/presentation/land-query-keys";

export function useDeleteLandOwnerMutation(plotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ownerId: string) => deleteLandOwner(plotId, ownerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: landKeys.owners(plotId) });
    },
  });
}
