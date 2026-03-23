"use client";

import { useState } from "react";
import { Box, Typography, Divider, Alert } from "@mui/material";
import { AppPageHeader, AppButton, AppInput, AppStatePanel, ShimmerBox } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useCompanySettingsQuery } from "@/modules/admin/presentation/hooks/use-company-settings-query";
import { useSetSettingMutation } from "@/modules/admin/presentation/hooks/use-set-setting-mutation";
import type { SettingKey } from "@/modules/admin/domain/admin";

// ─── Well-known settings config ───────────────────────────────────────────────

interface SettingConfig {
  key: SettingKey;
  label: string;
  placeholder: string;
  inputType: "number" | "text";
}

const KNOWN_SETTINGS: SettingConfig[] = [
  {
    key: "booking_days",
    label: "Срок бронирования (дней)",
    placeholder: "например: 7",
    inputType: "number",
  },
  {
    key: "penalty_rate",
    label: "Ставка пени (%)",
    placeholder: "например: 0.1",
    inputType: "number",
  },
  {
    key: "max_discount",
    label: "Максимальная скидка (%)",
    placeholder: "например: 10",
    inputType: "number",
  },
  {
    key: "primary_currency",
    label: "Основная валюта",
    placeholder: "например: TJS",
    inputType: "text",
  },
];

// ─── Setting row ──────────────────────────────────────────────────────────────

interface SettingRowProps {
  config: SettingConfig;
  currentValue: string | undefined;
  onSave: (key: string, value: string) => void;
  isSaving: boolean;
}

function SettingRow({ config, currentValue, onSave, isSaving }: SettingRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentValue ?? "");

  function handleEdit() {
    setEditValue(currentValue ?? "");
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setEditValue(currentValue ?? "");
  }

  function handleSave() {
    if (!editValue.trim()) return;
    onSave(config.key, editValue.trim());
    setEditing(false);
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 2,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
          {config.label}
        </Typography>
        {!editing && (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {currentValue ?? <span style={{ color: "var(--muted-foreground)" }}>—</span>}
          </Typography>
        )}
        {editing && (
          <AppInput
            label=""
            type={config.inputType}
            value={editValue}
            onChangeValue={setEditValue}
            placeholder={config.placeholder}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        {!editing && (
          <AppButton
            label="Изменить"
            variant="outline"
            size="sm"
            onClick={handleEdit}
          />
        )}
        {editing && (
          <>
            <AppButton
              label="Отмена"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            />
            <AppButton
              label="Сохранить"
              variant="primary"
              size="sm"
              disabled={!editValue.trim() || isSaving}
              onClick={handleSave}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsCompanyPage() {
  const { data: settings, isLoading, isError } = useCompanySettingsQuery();
  const setSettingMutation = useSetSettingMutation();

  const [successKey, setSuccessKey] = useState<string | null>(null);

  function getSettingValue(key: string): string | undefined {
    return settings?.find((s) => s.key === key)?.value;
  }

  function handleSave(key: string, value: string) {
    setSettingMutation.mutate(
      { key, value },
      {
        onSuccess: () => {
          setSuccessKey(key);
          setTimeout(() => setSuccessKey(null), 3000);
        },
      },
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Настройки компании"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "company", label: "Компания" },
        ]}
      />

      {isLoading && (
        <div className="space-y-3">
          <ShimmerBox className="h-16 w-full" />
          <ShimmerBox className="h-72 w-full" />
        </div>
      )}

      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить настройки компании. Попробуйте обновить страницу."
        />
      )}

      {!isLoading && !isError && (
        <>
          {successKey && (
            <Alert severity="success" onClose={() => setSuccessKey(null)}>
              Настройка сохранена успешно.
            </Alert>
          )}

          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              px: 3,
              py: 1,
            }}
          >
            <Typography variant="h6" sx={{ py: 2, fontWeight: 600 }}>
              Общие настройки
            </Typography>
            <Divider />
            {KNOWN_SETTINGS.map((config, index) => (
              <Box key={config.key}>
                <SettingRow
                  config={config}
                  currentValue={getSettingValue(config.key)}
                  onSave={handleSave}
                  isSaving={setSettingMutation.isPending}
                />
                {index < KNOWN_SETTINGS.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>

          {/* Payment settings */}
          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              px: 3,
              py: 1,
            }}
          >
            <Typography variant="h6" sx={{ py: 2, fontWeight: 600 }}>
              Оплаты
            </Typography>
            <Divider />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Автоматическое подтверждение платежей
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  При включении платежи подтверждаются сразу без ручной проверки
                </Typography>
              </Box>
              <AppButton
                label={getSettingValue("auto_confirm_payments") === "false" ? "Выключено" : "Включено"}
                variant={getSettingValue("auto_confirm_payments") === "false" ? "outline" : "primary"}
                size="sm"
                disabled={setSettingMutation.isPending}
                onClick={() => {
                  const current = getSettingValue("auto_confirm_payments");
                  const next = current === "false" ? "true" : "false";
                  handleSave("auto_confirm_payments", next);
                }}
              />
            </Box>
          </Box>
        </>
      )}
    </main>
  );
}
