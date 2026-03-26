"use client";

import { useMutation } from "@tanstack/react-query";
import { createTenantUser } from "@/modules/admin/infrastructure/admin-repository";
import type { CreateTenantUserInput } from "@/modules/admin/domain/admin";

interface CreateTenantUserArgs {
  tenantId: string;
  input: CreateTenantUserInput;
}

export function useCreateTenantUserMutation() {
  return useMutation({
    mutationFn: ({ tenantId, input }: CreateTenantUserArgs) =>
      createTenantUser(tenantId, input),
  });
}
