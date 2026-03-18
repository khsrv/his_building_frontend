"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLandPlot } from "@/modules/land/infrastructure/land-repository";
import { landKeys } from "@/modules/land/presentation/land-query-keys";

export function useDeleteLandPlotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLandPlot(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: landKeys.plots() });
    },
  });
}
