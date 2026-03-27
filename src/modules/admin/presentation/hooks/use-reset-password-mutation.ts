"use client";

import { useMutation } from "@tanstack/react-query";
import { resetUserPassword } from "@/modules/admin/infrastructure/admin-repository";

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetUserPassword(id, password),
  });
}
