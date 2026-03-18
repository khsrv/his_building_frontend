"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { toggleCanLogin } from "@/modules/admin/infrastructure/admin-repository";
import type { ToggleCanLoginInput } from "@/modules/admin/domain/admin";

export function useToggleCanLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ToggleCanLoginInput }) =>
      toggleCanLogin(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.user(variables.id) });
    },
  });
}
