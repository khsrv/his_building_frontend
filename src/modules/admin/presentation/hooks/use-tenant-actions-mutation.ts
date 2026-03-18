"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/modules/admin/presentation/admin-query-keys";
import {
  activateTenant,
  deactivateTenant,
  setSubscription,
} from "@/modules/admin/infrastructure/admin-repository";
import type { SetSubscriptionInput } from "@/modules/admin/domain/admin";

export type TenantAction =
  | { type: "activate"; id: string }
  | { type: "deactivate"; id: string }
  | { type: "setSubscription"; id: string; input: SetSubscriptionInput };

export type TenantActionResult = { status: string } | import("@/modules/admin/domain/admin").Tenant;

async function executeTenantAction(action: TenantAction): Promise<TenantActionResult> {
  if (action.type === "activate") return activateTenant(action.id);
  if (action.type === "deactivate") return deactivateTenant(action.id);
  return setSubscription(action.id, action.input);
}

export function useTenantActionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: executeTenantAction,
    onSuccess: (_data, action) => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenants() });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenant(action.id) });
    },
  });
}
