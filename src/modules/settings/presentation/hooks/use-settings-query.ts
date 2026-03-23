import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "@/modules/settings/infrastructure/settings-repository";

export const settingsKeys = {
  all: ["settings"] as const,
};

export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: fetchSettings,
    staleTime: 60_000,
  });
}
