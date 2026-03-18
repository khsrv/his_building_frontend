"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLandPlot } from "@/modules/land/infrastructure/land-repository";
import type { UpdateLandPlotInput } from "@/modules/land/domain/land";
import { landKeys } from "@/modules/land/presentation/land-query-keys";

export function useUpdateLandPlotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLandPlotInput }) =>
      updateLandPlot(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: landKeys.plots() });
      void queryClient.invalidateQueries({ queryKey: landKeys.plotDetail(variables.id) });
    },
  });
}
