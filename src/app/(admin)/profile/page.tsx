"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  AppButton,
  AppInput,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  ConfirmDialog,
  ShimmerBox,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { apiClient } from "@/shared/lib/http/api-client";
import {
  getResponseData,
  getResponseItems,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
import type { UserRole } from "@/shared/types/permissions";
import type {
  SessionDto,
  SessionsResponseDto,
  UserProfileDto,
  UserProfileResponseDto,
} from "@/modules/payments/infrastructure/dto";

// ─── Role labels ──────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Супер админ",
  company_admin: "Администратор",
  sales_head: "Руководитель продаж",
  manager: "Менеджер",
  accountant: "Бухгалтер",
  cashier: "Кассир",
  foreman: "Прораб",
  warehouse_manager: "Кладовщик",
  broker: "Брокер",
};

function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as UserRole] ?? role;
}

// ─── Query keys ───────────────────────────────────────────────────────────────

const profileKeys = {
  me: ["profile", "me"] as const,
  sessions: ["profile", "sessions"] as const,
};

// ─── Validation schemas ───────────────────────────────────────────────────────

const nameSchema = z.object({
  full_name: z.string().min(2, "Минимум 2 символа"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Введите текущий пароль"),
    new_password: z.string().min(8, "Минимум 8 символов"),
    confirm_new_password: z.string().min(8, "Минимум 8 символов"),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Пароли не совпадают",
    path: ["confirm_new_password"],
  });

// ─── Date formatter ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Avatar with initials ─────────────────────────────────────────────────────

function AvatarInitials({ fullName }: { fullName: string }) {
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => (w[0] ?? "").toUpperCase())
    .join("");

  return (
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </Box>
  );
}

// ─── Personal Info Card ───────────────────────────────────────────────────────

interface PersonalInfoCardProps {
  profile: UserProfileDto;
  onUpdated: () => void;
}

function PersonalInfoCard({ profile, onUpdated }: PersonalInfoCardProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [nameError, setNameError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (name: string) =>
      apiClient.patch<UserProfileResponseDto>("/api/v1/users/me", {
        full_name: name,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.me });
      setEditing(false);
      onUpdated();
    },
  });

  const handleSave = () => {
    const parsed = nameSchema.safeParse({ full_name: fullName });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Ошибка валидации";
      setNameError(msg);
      return;
    }
    setNameError(null);
    updateMutation.mutate(fullName);
  };

  const handleCancel = () => {
    setFullName(profile.full_name);
    setNameError(null);
    setEditing(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Личные данные
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <AvatarInitials fullName={profile.full_name} />
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {profile.full_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.email}
          </Typography>
          <Box mt={0.5}>
            <AppStatusBadge
              label={getRoleLabel(profile.role)}
              tone="info"
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {editing ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label="Полное имя"
            value={fullName}
            onChangeValue={(v) => setFullName(v)}
            {...(nameError ? { errorText: nameError } : {})}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <AppButton
              label="Сохранить"
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            />
            <AppButton
              label="Отмена"
              variant="outline"
              size="md"
              onClick={handleCancel}
            />
          </Box>
          {updateMutation.isError ? (
            <Alert severity="error">Не удалось сохранить изменения</Alert>
          ) : null}
        </Box>
      ) : (
        <AppButton
          label="Редактировать"
          variant="outline"
          size="md"
          onClick={() => setEditing(true)}
        />
      )}
    </Paper>
  );
}

// ─── Change Password Card ─────────────────────────────────────────────────────

interface PasswordFields {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

interface PasswordErrors {
  current_password?: string | undefined;
  new_password?: string | undefined;
  confirm_new_password?: string | undefined;
}

function ChangePasswordCard({ onSuccess }: { onSuccess: () => void }) {
  const [fields, setFields] = useState<PasswordFields>({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [errors, setErrors] = useState<PasswordErrors>({});

  const mutation = useMutation({
    mutationFn: (values: PasswordFields) =>
      apiClient.post("/api/v1/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
      }),
    onSuccess: () => {
      setFields({ current_password: "", new_password: "", confirm_new_password: "" });
      setErrors({});
      onSuccess();
    },
  });

  const handleChange = (field: keyof PasswordFields) => (value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const parsed = passwordSchema.safeParse(fields);
    if (!parsed.success) {
      const fieldErrors: PasswordErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path === "current_password" || path === "new_password" || path === "confirm_new_password") {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate(fields);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Изменить пароль
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AppInput
          label="Текущий пароль"
          type="password"
          autoComplete="current-password"
          value={fields.current_password}
          onChangeValue={handleChange("current_password")}
          {...(errors.current_password ? { errorText: errors.current_password } : {})}
        />
        <AppInput
          label="Новый пароль"
          type="password"
          autoComplete="new-password"
          value={fields.new_password}
          onChangeValue={handleChange("new_password")}
          {...(errors.new_password ? { errorText: errors.new_password } : {})}
        />
        <AppInput
          label="Подтвердите пароль"
          type="password"
          autoComplete="new-password"
          value={fields.confirm_new_password}
          onChangeValue={handleChange("confirm_new_password")}
          {...(errors.confirm_new_password ? { errorText: errors.confirm_new_password } : {})}
        />

        {mutation.isError ? (
          <Alert severity="error">Не удалось изменить пароль. Проверьте текущий пароль.</Alert>
        ) : null}

        <AppButton
          label="Изменить пароль"
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={mutation.isPending}
        />
      </Box>
    </Paper>
  );
}

// ─── Sessions Section ─────────────────────────────────────────────────────────

function truncateUserAgent(ua: string, max = 60): string {
  return ua.length > max ? `${ua.slice(0, max)}\u2026` : ua;
}

function SessionsSection() {
  const queryClient = useQueryClient();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const { data: sessions, isLoading, isError, refetch } = useQuery({
    queryKey: profileKeys.sessions,
    queryFn: async () => {
      const response = await apiClient.get<SessionsResponseDto>(
        "/api/v1/auth/sessions",
      );
      const normalized = normalizeApiKeys(response);
      const items = getResponseItems<SessionDto>(normalized);
      return items.map((session) => ({
        id: session.id,
        user_agent: session.user_agent ?? "",
        ip_address: session.ip_address ?? "",
        created_at: session.created_at ?? "",
        last_used_at: session.last_used_at ?? session.expires_at ?? session.created_at ?? "",
        ...(session.expires_at ? { expires_at: session.expires_at } : {}),
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/v1/auth/sessions/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.sessions });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const list = sessions ?? [];
      await Promise.all(
        list.map((s) => apiClient.delete(`/api/v1/auth/sessions/${s.id}`)),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.sessions });
    },
  });

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Активные сессии
        </Typography>
        {sessions && sessions.length > 0 ? (
          <AppButton
            label="Завершить все сессии"
            variant="outline"
            size="sm"
            onClick={() => setConfirmDeleteAll(true)}
            disabled={deleteAllMutation.isPending}
          />
        ) : null}
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {[1, 2, 3].map((i) => (
            <ShimmerBox key={i} style={{ height: 56, borderRadius: 8 }} />
          ))}
        </Box>
      ) : isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки сессий"
          actionLabel="Повторить"
          onAction={() => void refetch()}
        />
      ) : !sessions || sessions.length === 0 ? (
        <AppStatePanel
          tone="empty"
          title="Нет активных сессий"
          description="Активных сессий не найдено."
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {(sessions as readonly SessionDto[]).map((session) => (
            <Box
              key={session.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Tooltip title={session.user_agent} placement="top-start">
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    noWrap
                    sx={{ maxWidth: 400 }}
                  >
                    {truncateUserAgent(session.user_agent)}
                  </Typography>
                </Tooltip>
                <Typography variant="caption" color="text.secondary">
                  IP: {session.ip_address} &nbsp;&middot;&nbsp; Создан:{" "}
                  {formatDate(session.created_at)} &nbsp;&middot;&nbsp; Последний:{" "}
                  {formatDate(session.last_used_at)}
                </Typography>
              </Box>
              <AppButton
                label="Завершить"
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteId(session.id)}
                disabled={deleteMutation.isPending}
              />
            </Box>
          ))}
        </Box>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Завершить сессию"
        message="Вы уверены, что хотите завершить эту сессию?"
        confirmText="Завершить"
        cancelText="Отмена"
        destructive
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            deleteMutation.mutate(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
        onClose={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmDeleteAll}
        title="Завершить все сессии"
        message="Все активные сессии будут завершены. Вы уверены?"
        confirmText="Завершить все"
        cancelText="Отмена"
        destructive
        onConfirm={() => {
          deleteAllMutation.mutate();
          setConfirmDeleteAll(false);
        }}
        onClose={() => setConfirmDeleteAll(false)}
      />
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const response = await apiClient.get<UserProfileResponseDto>(
        "/api/v1/users/me",
      );
      return getResponseData<UserProfileDto>(normalizeApiKeys(response));
    },
    staleTime: 60_000,
  });

  const showSuccess = (msg: string) => setSuccessMessage(msg);

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Профиль"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "profile", label: "Профиль" },
        ]}
      />

      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <ShimmerBox style={{ height: 260, borderRadius: 12 }} />
          <ShimmerBox style={{ height: 260, borderRadius: 12 }} />
        </Box>
      ) : isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки профиля"
          description="Не удалось загрузить данные профиля"
          actionLabel="Повторить"
          onAction={() => void refetch()}
        />
      ) : profile ? (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            <PersonalInfoCard
              profile={profile}
              onUpdated={() => showSuccess("Профиль обновлён")}
            />
            <ChangePasswordCard onSuccess={() => showSuccess("Пароль успешно изменён")} />
          </Box>

          <SessionsSection />
        </>
      ) : null}

      <Snackbar
        open={successMessage !== null}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </main>
  );
}
