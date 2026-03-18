"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLandPlot } from "@/modules/land/infrastructure/land-repository";
import type { CreateLandPlotInput } from "@/modules/land/domain/land";
import { landKeys } from "@/modules/land/presentation/land-query-keys";

export function useCreateLandPlotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLandPlotInput) => createLandPlot(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: landKeys.plots() });
    },
  });
}
