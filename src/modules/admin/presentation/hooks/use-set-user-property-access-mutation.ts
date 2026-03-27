"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import { setUserPropertyAccess } from "@/modules/admin/infrastructure/admin-repository";

export function useSetUserPropertyAccessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, propertyIds }: { id: string; propertyIds: string[] }) =>
      setUserPropertyAccess(id, propertyIds),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.userPropertyAccess(variables.id),
      });
    },
  });
}
