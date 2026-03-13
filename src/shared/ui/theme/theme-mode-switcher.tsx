"use client";

import { useI18n } from "@/shared/providers/locale-provider";
import { useThemeMode } from "@/shared/providers/theme-provider";
import { AppSelect } from "@/shared/ui/primitives/select";

export function ThemeModeSwitcher() {
  const { t } = useI18n();
  const { mode, setMode } = useThemeMode();

  return (
    <AppSelect
      aria-label={t("theme.label")}
      label={t("theme.label")}
      onChange={(event) => setMode(event.target.value as "light" | "dark" | "system")}
      options={[
        { label: t("theme.system"), value: "system" },
        { label: t("theme.light"), value: "light" },
        { label: t("theme.dark"), value: "dark" },
      ]}
      value={mode}
    />
  );
}
