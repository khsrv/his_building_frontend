"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionUser } from "@/modules/auth/domain/session";

async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me", { cache: "no-store" });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  const body = (await response.json()) as { data: SessionUser };
  return body.data;
}

export function useAuth() {
  const query = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
