"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "hisob:selectedPropertyId";

function readStoredPropertyId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

interface PropertyContextValue {
  /** Currently selected property ID. Empty string means "all properties". */
  readonly currentPropertyId: string;
  /** Set the selected property. Pass empty string for "all". */
  readonly setCurrentPropertyId: (id: string) => void;
  /** Whether a specific property is selected (not "all"). */
  readonly hasProperty: boolean;
}

const PropertyContext = createContext<PropertyContextValue | null>(null);

interface PropertyProviderProps {
  children: ReactNode;
}

export function PropertyProvider({ children }: PropertyProviderProps) {
  const [currentPropertyId, setRawPropertyId] = useState<string>(readStoredPropertyId);
  const queryClient = useQueryClient();

  const setCurrentPropertyId = useCallback((id: string) => {
    setRawPropertyId(id);
    // Invalidate all cached queries so per-property data is re-fetched
    // after switching to a different property context.
    void queryClient.invalidateQueries();
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable — ignore
    }
  }, [queryClient]);

  const value = useMemo<PropertyContextValue>(
    () => ({
      currentPropertyId,
      setCurrentPropertyId,
      hasProperty: currentPropertyId !== "",
    }),
    [currentPropertyId, setCurrentPropertyId],
  );

  return (
    <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>
  );
}

/**
 * Access global property context.
 * Returns the selected property ID and setter.
 */
export function usePropertyContext(): PropertyContextValue {
  const ctx = useContext(PropertyContext);
  if (!ctx) {
    throw new Error("usePropertyContext must be used within PropertyProvider");
  }
  return ctx;
}
