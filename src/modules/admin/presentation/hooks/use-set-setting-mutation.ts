"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { setSetting } from "@/modules/admin/infrastructure/admin-repository";
import type { SetSettingInput } from "@/modules/admin/domain/admin";

export function useSetSettingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetSettingInput) => setSetting(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.settings() });
    },
  });
}
