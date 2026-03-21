"use client";

import { useCallback, useMemo, useState } from "react";
import { Alert, Box, Chip, Snackbar, Typography } from "@mui/material";
import {
  AppPageHeader,
  AppButton,
  AppDataTable,
  AppDrawerForm,
  AppInput,
  AppSelect,
  AppStatusBadge,
  AppStatePanel,
  ShimmerBox,
  ConfirmDialog,
} from "@/shared/ui";
import type { AppDataTableColumn } from "@/shared/ui/primitives/data-table/types";
import type { AppActionMenuGroup } from "@/shared/ui/primitives/action-menu";
import { routes } from "@/shared/constants/routes";
import { useUsersListQuery } from "@/modules/admin/presentation/hooks/use-users-list-query";
import { useCreateUserMutation } from "@/modules/admin/presentation/hooks/use-create-user-mutation";
import { useUpdateUserRoleMutation } from "@/modules/admin/presentation/hooks/use-update-user-role-mutation";
import { useToggleCanLoginMutation } from "@/modules/admin/presentation/hooks/use-toggle-can-login-mutation";
import { useAuth } from "@/modules/auth/presentation/hooks/use-auth";
import type { AdminUser, BackendRole } from "@/modules/admin/domain/admin";

// ─── Role config ──────────────────────────────────────────────────────────────

interface RoleConfig {
  label: string;
  description: string;
  group: string;
  color: string;
  bgColor: string;
}

const ROLE_CONFIG: Record<Exclude<BackendRole, "super_admin">, RoleConfig> = {
  company_admin: {
    label: "Администратор",
    description: "Полный доступ ко всему",
    group: "Управление",
    color: "#7c3aed",
    bgColor: "#7c3aed20",
  },
  sales_head: {
    label: "Рук. продаж",
    description: "Управляет командой, видит финансы",
    group: "Продажи",
    color: "#2563eb",
    bgColor: "#2563eb20",
  },
  manager: {
    label: "Менеджер",
    description: "Работа с клиентами и сделками",
    group: "Продажи",
    color: "#0891b2",
    bgColor: "#0891b220",
  },
  accountant: {
    label: "Бухгалтер",
    description: "Отчёты, транзакции, залоги",
    group: "Финансы",
    color: "#16a34a",
    bgColor: "#16a34a20",
  },
  cashier: {
    label: "Кассир",
    description: "Приём и подтверждение платежей",
    group: "Финансы",
    color: "#65a30d",
    bgColor: "#65a30d20",
  },
  foreman: {
    label: "Прораб",
    description: "Работа с нарядами",
    group: "Склад и стройка",
    color: "#ea580c",
    bgColor: "#ea580c20",
  },
  warehouse_manager: {
    label: "Нач. склада",
    description: "Материалы, поставщики, движение",
    group: "Склад и стройка",
    color: "#92400e",
    bgColor: "#92400e20",
  },
  broker: {
    label: "Брокер",
    description: "Внешний партнёр по продажам",
    group: "Продажи",
    color: "#6366f1",
    bgColor: "#6366f120",
  },
};

function getRoleConfig(role: BackendRole): RoleConfig {
  if (role === "super_admin") {
    return { label: "Супер админ", description: "", group: "", color: "#dc2626", bgColor: "#dc262620" };
  }
  return ROLE_CONFIG[role] ?? { label: role, description: "", group: "", color: "#64748b", bgColor: "#64748b20" };
}

function getRoleLabel(role: BackendRole): string {
  return getRoleConfig(role).label;
}

// Grouped role options for select (without super_admin)
const ROLE_SELECT_OPTIONS: { value: BackendRole; label: string }[] = [
  { value: "sales_head", label: "Рук. продаж — управляет командой, видит финансы" },
  { value: "manager", label: "Менеджер — работа с клиентами и сделками" },
  { value: "broker", label: "Брокер — внешний партнёр по продажам" },
  { value: "accountant", label: "Бухгалтер — отчёты, транзакции, залоги" },
  { value: "cashier", label: "Кассир — приём и подтверждение платежей" },
  { value: "warehouse_manager", label: "Нач. склада — материалы, поставщики" },
  { value: "foreman", label: "Прораб — работа с нарядами" },
  { value: "company_admin", label: "Администратор — полный доступ ко всему" },
];

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "Все роли" },
  ...Object.entries(ROLE_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

function RoleBadge({ role }: { role: BackendRole }) {
  const config = getRoleConfig(role);
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: 12,
        color: config.color,
        bgcolor: config.bgColor,
        border: "none",
      }}
    />
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Password helpers ─────────────────────────────────────────────────────────

function generatePassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (byte) => charset[byte % charset.length]).join("");
}

function getPasswordStrength(pw: string): { label: string; color: string } {
  if (pw.length < 8) return { label: "Слабый", color: "#dc2626" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (score >= 3 && pw.length >= 10) return { label: "Сильный", color: "#16a34a" };
  if (score >= 2) return { label: "Средний", color: "#ea580c" };
  return { label: "Слабый", color: "#dc2626" };
}

// ─── Form states ──────────────────────────────────────────────────────────────

interface CreateFormState {
  fullName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: BackendRole;
  showPassword: boolean;
}

type CreateFormErrors = Partial<
  Record<"fullName" | "email" | "password" | "passwordConfirm" | "server", string>
>;

const INITIAL_CREATE_FORM: CreateFormState = {
  fullName: "",
  email: "",
  password: "",
  passwordConfirm: "",
  role: "manager",
  showPassword: false,
};

interface ToggleLoginState {
  userId: string;
  userName: string;
  userEmail: string;
  currentCanLogin: boolean;
}

interface ChangeRoleState {
  userId: string;
  userName: string;
  currentRole: BackendRole;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsUsersPage() {
  const { data, isLoading, isError } = useUsersListQuery({ limit: 100 });
  const createMutation = useCreateUserMutation();
  const updateRoleMutation = useUpdateUserRoleMutation();
  const toggleLoginMutation = useToggleCanLoginMutation();
  const { user: currentUser } = useAuth();

  // Filter
  const [roleFilter, setRoleFilter] = useState("");

  // Drawer: create user
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(INITIAL_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState<CreateFormErrors>({});

  // Toast for copy credentials
  const [toast, setToast] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  // Drawer: change role
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [changeRoleState, setChangeRoleState] = useState<ChangeRoleState | null>(null);
  const [selectedRole, setSelectedRole] = useState<BackendRole>("manager");

  // Confirm: toggle can_login
  const [toggleLoginState, setToggleLoginState] = useState<ToggleLoginState | null>(null);

  const users = data?.items ?? [];
  const totalCount = data?.total ?? users.length;

  const filteredUsers = useMemo(
    () => (roleFilter ? users.filter((u) => u.role === roleFilter) : users),
    [users, roleFilter],
  );

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columns: readonly AppDataTableColumn<AdminUser>[] = [
    {
      id: "fullName",
      header: "Сотрудник",
      cell: (row) => (
        <div style={{ opacity: row.canLogin ? 1 : 0.5 }}>
          <p className="text-sm font-medium text-foreground">{row.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
      searchAccessor: (row) => `${row.fullName} ${row.email}`,
      sortAccessor: (row) => row.fullName,
    },
    {
      id: "role",
      header: "Роль",
      cell: (row) => (
        <span style={{ opacity: row.canLogin ? 1 : 0.5 }}>
          <RoleBadge role={row.role} />
        </span>
      ),
      sortAccessor: (row) => getRoleLabel(row.role),
    },
    {
      id: "canLogin",
      header: "Статус",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: row.canLogin ? "#16a34a" : "#dc2626" }}
          />
          <span
            className="text-xs"
            style={{ opacity: row.canLogin ? 1 : 0.5 }}
          >
            {row.canLogin ? "Активен" : "Заблокирован"}
          </span>
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Дата добавления",
      cell: (row) => (
        <span style={{ opacity: row.canLogin ? 1 : 0.5 }}>
          {formatDate(row.createdAt)}
        </span>
      ),
      sortAccessor: (row) => row.createdAt,
    },
  ];

  // ─── Row actions ───────────────────────────────────────────────────────────

  const getRowActions = useCallback(
    (row: AdminUser): readonly AppActionMenuGroup[] => {
      const isSelf = currentUser?.id === row.id;
      if (isSelf) return [];

      return [
        {
          id: "main",
          items: [
            {
              id: "change-role",
              label: "Изменить роль",
              onClick: () => {
                setChangeRoleState({
                  userId: row.id,
                  userName: row.fullName,
                  currentRole: row.role,
                });
                setSelectedRole(row.role);
                setRoleDrawerOpen(true);
              },
            },
            {
              id: "toggle-login",
              label: row.canLogin ? "Заблокировать" : "Разблокировать",
              onClick: () => {
                setToggleLoginState({
                  userId: row.id,
                  userName: row.fullName,
                  userEmail: row.email,
                  currentCanLogin: row.canLogin,
                });
              },
            },
          ],
        },
      ];
    },
    [currentUser?.id],
  );

  // ─── Create form validation ────────────────────────────────────────────────

  function validateCreateForm(): boolean {
    const next: CreateFormErrors = {};
    if (!createForm.fullName.trim() || createForm.fullName.trim().length < 2) {
      next.fullName = "Минимум 2 символа";
    }
    if (!createForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      next.email = "Введите корректный email";
    }
    if (createForm.password.length < 8) {
      next.password = "Минимум 8 символов";
    } else if (createForm.password.length > 72) {
      next.password = "Максимум 72 символа";
    }
    if (createForm.password !== createForm.passwordConfirm) {
      next.passwordConfirm = "Пароли не совпадают";
    }
    setCreateErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleCreateSave() {
    if (!validateCreateForm()) return;
    const savedPassword = createForm.password;
    const savedEmail = createForm.email.trim();

    createMutation.mutate(
      {
        fullName: createForm.fullName.trim(),
        email: savedEmail,
        password: savedPassword,
        role: createForm.role,
      },
      {
        onSuccess: () => {
          setCreateDrawerOpen(false);
          setCreateForm(INITIAL_CREATE_FORM);
          setCreateErrors({});
          setCreatedCredentials({ email: savedEmail, password: savedPassword });
          setToast("Сотрудник добавлен");
        },
        onError: (error) => {
          const msg = error instanceof Error ? error.message : "";
          if (msg.includes("409") || msg.toLowerCase().includes("already")) {
            setCreateErrors({ server: "Пользователь с таким email уже существует" });
          } else if (msg.includes("429") || msg.toLowerCase().includes("limit")) {
            setCreateErrors({ server: "Достигнут лимит сотрудников. Обратитесь к администратору системы" });
          } else {
            setCreateErrors({ server: msg || "Не удалось создать сотрудника" });
          }
        },
      },
    );
  }

  function handleGeneratePassword() {
    const pw = generatePassword();
    setCreateForm((prev) => ({
      ...prev,
      password: pw,
      passwordConfirm: pw,
      showPassword: true,
    }));
  }

  async function handleCopyCredentials() {
    if (!createdCredentials) return;
    const text = `Email: ${createdCredentials.email}\nПароль: ${createdCredentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast("Данные скопированы в буфер обмена");
    } catch {
      setToast("Не удалось скопировать");
    }
    setCreatedCredentials(null);
  }

  async function handleCopyPassword() {
    if (!createForm.password) return;
    try {
      await navigator.clipboard.writeText(createForm.password);
      setToast("Пароль скопирован");
    } catch {
      // ignore
    }
  }

  // ─── Change role ────────────────────────────────────────────────────────────

  function handleRoleSave() {
    if (!changeRoleState) return;
    updateRoleMutation.mutate(
      { id: changeRoleState.userId, input: { role: selectedRole } },
      {
        onSuccess: () => {
          setRoleDrawerOpen(false);
          setChangeRoleState(null);
          setToast("Роль изменена");
        },
      },
    );
  }

  // ─── Toggle login ──────────────────────────────────────────────────────────

  function handleToggleLoginConfirm() {
    if (!toggleLoginState) return;
    toggleLoginMutation.mutate(
      {
        id: toggleLoginState.userId,
        input: { canLogin: !toggleLoginState.currentCanLogin },
      },
      {
        onSuccess: () => {
          const wasBlocking = toggleLoginState.currentCanLogin;
          setToggleLoginState(null);
          setToast(wasBlocking ? "Сотрудник заблокирован" : "Доступ восстановлен");
        },
      },
    );
  }

  // ─── Password strength ─────────────────────────────────────────────────────
  const pwStrength = createForm.password ? getPasswordStrength(createForm.password) : null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Сотрудники"
        subtitle={`${totalCount} сотрудников`}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "users", label: "Сотрудники" },
        ]}
        actions={
          <AppButton
            label="+ Добавить сотрудника"
            variant="primary"
            size="md"
            onClick={() => {
              setCreateForm(INITIAL_CREATE_FORM);
              setCreateErrors({});
              setCreateDrawerOpen(true);
            }}
          />
        }
      />

      {isLoading && (
        <div className="space-y-3">
          <ShimmerBox className="h-16 w-full" />
          <ShimmerBox className="h-96 w-full" />
        </div>
      )}

      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить список сотрудников. Попробуйте обновить страницу."
        />
      )}

      {!isLoading && !isError && (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="w-48">
              <AppSelect
                id="role-filter"
                label="Роль"
                options={ROLE_FILTER_OPTIONS}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              />
            </div>
          </div>
          <AppDataTable
            columns={columns}
            data={filteredUsers}
            rowKey={(row) => row.id}
            rowActions={getRowActions}
            rowActionsTriggerLabel="Действия"
            searchPlaceholder="Поиск по имени или email..."
            enableSettings
            storageKey="settings-users-table"
          />
        </>
      )}

      {/* ── Create user drawer ── */}
      <AppDrawerForm
        open={createDrawerOpen}
        title="Новый сотрудник"
        subtitle="Заполните данные нового сотрудника"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={createMutation.isPending}
        onClose={() => setCreateDrawerOpen(false)}
        onSave={handleCreateSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {createErrors.server ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {createErrors.server}
            </Alert>
          ) : null}

          <AppInput
            label="ФИО *"
            value={createForm.fullName}
            onChangeValue={(v) => setCreateForm((prev) => ({ ...prev, fullName: v }))}
            placeholder="Иванов Иван Иванович"
            {...(createErrors.fullName ? { errorText: createErrors.fullName } : {})}
          />
          <AppInput
            label="Email *"
            type="email"
            value={createForm.email}
            onChangeValue={(v) => setCreateForm((prev) => ({ ...prev, email: v }))}
            placeholder="ivan@company.uz"
            {...(createErrors.email ? { errorText: createErrors.email } : {})}
          />

          <Box>
            <AppInput
              label="Пароль * (мин. 8 символов)"
              type={createForm.showPassword ? "text" : "password"}
              value={createForm.password}
              onChangeValue={(v) => setCreateForm((prev) => ({ ...prev, password: v }))}
              placeholder="Минимум 8 символов"
              {...(createErrors.password ? { errorText: createErrors.password } : {})}
            />
            {pwStrength ? (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: "block", color: pwStrength.color, fontWeight: 600 }}
              >
                Надёжность: {pwStrength.label}
              </Typography>
            ) : null}
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <AppButton
                label={createForm.showPassword ? "Скрыть" : "Показать"}
                variant="outline"
                size="sm"
                onClick={() =>
                  setCreateForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                }
              />
              <AppButton
                label="Сгенерировать"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
              />
              {createForm.password ? (
                <AppButton
                  label="Копировать"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopyPassword()}
                />
              ) : null}
            </Box>
          </Box>

          <AppInput
            label="Подтверждение пароля *"
            type={createForm.showPassword ? "text" : "password"}
            value={createForm.passwordConfirm}
            onChangeValue={(v) => setCreateForm((prev) => ({ ...prev, passwordConfirm: v }))}
            placeholder="Повторите пароль"
            {...(createErrors.passwordConfirm ? { errorText: createErrors.passwordConfirm } : {})}
          />

          <AppSelect
            label="Роль *"
            id="create-user-role"
            options={ROLE_SELECT_OPTIONS}
            value={createForm.role}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                role: e.target.value as BackendRole,
              }))
            }
          />
        </Box>
      </AppDrawerForm>

      {/* ── Change role drawer ── */}
      <AppDrawerForm
        open={roleDrawerOpen}
        title={`Изменить роль — ${changeRoleState?.userName ?? ""}`}
        subtitle="После смены роли у сотрудника изменится доступ к разделам системы"
        saveLabel="Сохранить"
        cancelLabel="Отмена"
        isSaving={updateRoleMutation.isPending}
        saveDisabled={updateRoleMutation.isPending}
        onClose={() => {
          setRoleDrawerOpen(false);
          setChangeRoleState(null);
        }}
        onSave={handleRoleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {changeRoleState ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Текущая роль:
              </Typography>
              <RoleBadge role={changeRoleState.currentRole} />
            </Box>
          ) : null}
          <AppSelect
            label="Новая роль *"
            id="change-user-role"
            options={ROLE_SELECT_OPTIONS}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as BackendRole)}
          />
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            После смены роли у сотрудника изменится доступ к разделам системы
          </Alert>
        </Box>
      </AppDrawerForm>

      {/* ── Confirm toggle can_login ── */}
      <ConfirmDialog
        open={toggleLoginState !== null}
        title={
          toggleLoginState?.currentCanLogin
            ? "Заблокировать сотрудника?"
            : "Разблокировать сотрудника?"
        }
        message={
          toggleLoginState?.currentCanLogin
            ? `${toggleLoginState.userName} (${toggleLoginState.userEmail}) не сможет войти в систему. Все активные сессии будут завершены.`
            : `${toggleLoginState?.userName ?? ""} (${toggleLoginState?.userEmail ?? ""}) снова сможет войти в систему.`
        }
        confirmText={toggleLoginState?.currentCanLogin ? "Заблокировать" : "Разблокировать"}
        cancelText="Отмена"
        destructive={toggleLoginState?.currentCanLogin === true}
        onConfirm={handleToggleLoginConfirm}
        onClose={() => setToggleLoginState(null)}
      />

      {/* ── Toast ── */}
      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToast(null)}
          action={
            createdCredentials ? (
              <AppButton
                label="Скопировать данные для входа"
                variant="outline"
                size="sm"
                onClick={() => void handleCopyCredentials()}
              />
            ) : undefined
          }
        >
          {toast}
        </Alert>
      </Snackbar>
    </main>
  );
}
