"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { updateUserRole } from "@/modules/admin/infrastructure/admin-repository";
import type { UpdateUserRoleInput } from "@/modules/admin/domain/admin";

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserRoleInput }) =>
      updateUserRole(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.user(variables.id) });
    },
  });
}
