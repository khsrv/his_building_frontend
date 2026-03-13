"use client";

import { useI18n } from "@/shared/providers/locale-provider";
import { AppSelect } from "@/shared/ui/primitives/select";

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <AppSelect
      aria-label={t("locale.label")}
      label={t("locale.label")}
      onChange={(event) => setLocale(event.target.value as "ru" | "en" | "tg" | "uz")}
      options={[
        { label: t("locale.ru"), value: "ru" },
        { label: t("locale.en"), value: "en" },
        { label: t("locale.tg"), value: "tg" },
        { label: t("locale.uz"), value: "uz" },
      ]}
      value={locale}
    />
  );
}
