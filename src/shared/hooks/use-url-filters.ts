"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UrlFilters = Record<string, string>;

interface UseUrlFiltersOptions {
  keys: readonly string[];
  mode?: "replace" | "push";
}

export function useUrlFilters({ keys, mode = "replace" }: UseUrlFiltersOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<UrlFilters>(() => {
    return keys.reduce<UrlFilters>((accumulator, key) => {
      accumulator[key] = searchParams.get(key) ?? "";
      return accumulator;
    }, {});
  }, [keys, searchParams]);

  const commit = useCallback(
    (nextFilters: Partial<UrlFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (!value || value.trim() === "") {
          params.delete(key);
          return;
        }

        params.set(key, value);
      });

      const url = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      if (mode === "push") {
        router.push(url);
      } else {
        router.replace(url);
      }
    },
    [mode, pathname, router, searchParams],
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      commit({ [key]: value });
    },
    [commit],
  );

  const setFilters = useCallback(
    (nextFilters: Partial<UrlFilters>) => {
      commit(nextFilters);
    },
    [commit],
  );

  const clearFilters = useCallback(() => {
    const resets = keys.reduce<Partial<UrlFilters>>((accumulator, key) => {
      accumulator[key] = "";
      return accumulator;
    }, {});
    commit(resets);
  }, [commit, keys]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
  };
}
