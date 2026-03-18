"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { CurrencyCode } from "@/shared/types/enums";

export interface TenantInfo {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly baseCurrency: CurrencyCode;
  readonly plan: "starter" | "business" | "enterprise";
  readonly logoUrl: string | null;
}

interface TenantContextValue {
  readonly tenant: TenantInfo | null;
  readonly isLoaded: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoaded: false,
});

interface TenantProviderProps {
  tenant: TenantInfo | null;
  children: ReactNode;
}

export function TenantProvider({ tenant, children }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ tenant, isLoaded: true }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  return useContext(TenantContext);
}

/** Throws if no tenant loaded — use in components that REQUIRE tenant context */
export function useRequiredTenant(): TenantInfo {
  const { tenant } = useContext(TenantContext);
  if (!tenant) {
    throw new Error("useTenant: no tenant in context. Wrap with TenantProvider.");
  }
  return tenant;
}
