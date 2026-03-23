import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setSetting } from "@/modules/settings/infrastructure/settings-repository";
import { settingsKeys } from "@/modules/settings/presentation/hooks/use-settings-query";

export function useSetSettingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => setSetting(key, value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
