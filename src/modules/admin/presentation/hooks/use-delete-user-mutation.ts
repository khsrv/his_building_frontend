"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { deleteUser } from "@/modules/admin/infrastructure/admin-repository";

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
    },
  });
}
