"use client";

import { useState } from "react";
import { Box } from "@mui/material";
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
import type { AdminUser, BackendRole } from "@/modules/admin/domain/admin";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: BackendRole; label: string }[] = [
  { value: "company_admin", label: "Администратор" },
  { value: "sales_head", label: "Руководитель продаж" },
  { value: "manager", label: "Менеджер" },
  { value: "accountant", label: "Бухгалтер" },
  { value: "cashier", label: "Кассир" },
  { value: "foreman", label: "Прораб" },
  { value: "warehouse_manager", label: "Кладовщик" },
  { value: "broker", label: "Брокер" },
];

function getRoleLabel(role: BackendRole): string {
  const found = ROLE_OPTIONS.find((o) => o.value === role);
  return found?.label ?? role;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU");
  } catch {
    return dateStr;
  }
}

// ─── Form states ──────────────────────────────────────────────────────────────

interface CreateFormState {
  fullName: string;
  email: string;
  password: string;
  role: BackendRole;
}

const INITIAL_CREATE_FORM: CreateFormState = {
  fullName: "",
  email: "",
  password: "",
  role: "manager",
};

interface ToggleLoginState {
  userId: string;
  userName: string;
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

  // Drawer: create user
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(INITIAL_CREATE_FORM);

  // Drawer: change role
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [changeRoleState, setChangeRoleState] = useState<ChangeRoleState | null>(null);
  const [selectedRole, setSelectedRole] = useState<BackendRole>("manager");

  // Confirm: toggle can_login
  const [toggleLoginState, setToggleLoginState] = useState<ToggleLoginState | null>(null);

  const users = data?.items ?? [];

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columns: readonly AppDataTableColumn<AdminUser>[] = [
    {
      id: "fullName",
      header: "ФИО",
      cell: (row) => row.fullName,
      searchAccessor: (row) => row.fullName,
      sortAccessor: (row) => row.fullName,
    },
    {
      id: "email",
      header: "Email",
      cell: (row) => row.email,
      searchAccessor: (row) => row.email,
    },
    {
      id: "role",
      header: "Роль",
      cell: (row) => (
        <AppStatusBadge
          label={getRoleLabel(row.role)}
          tone={
            row.role === "company_admin"
              ? "info"
              : row.role === "sales_head"
                ? "default"
                : "muted"
          }
        />
      ),
      sortAccessor: (row) => getRoleLabel(row.role),
    },
    {
      id: "canLogin",
      header: "Доступ",
      cell: (row) => (
        <AppStatusBadge
          label={row.canLogin ? "Активен" : "Заблокирован"}
          tone={row.canLogin ? "success" : "danger"}
        />
      ),
    },
    {
      id: "createdAt",
      header: "Дата создания",
      cell: (row) => formatDate(row.createdAt),
      sortAccessor: (row) => row.createdAt,
    },
  ];

  // ─── Row actions ───────────────────────────────────────────────────────────

  function getRowActions(row: AdminUser): readonly AppActionMenuGroup[] {
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
            label: row.canLogin ? "Заблокировать доступ" : "Разрешить доступ",
            onClick: () => {
              setToggleLoginState({
                userId: row.id,
                userName: row.fullName,
                currentCanLogin: row.canLogin,
              });
            },
          },
        ],
      },
    ];
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleCreateSave() {
    if (
      !createForm.fullName.trim() ||
      !createForm.email.trim() ||
      createForm.password.length < 8
    ) {
      return;
    }
    createMutation.mutate(
      {
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      },
      {
        onSuccess: () => {
          setCreateDrawerOpen(false);
          setCreateForm(INITIAL_CREATE_FORM);
        },
      },
    );
  }

  function handleRoleSave() {
    if (!changeRoleState) return;
    updateRoleMutation.mutate(
      { id: changeRoleState.userId, input: { role: selectedRole } },
      {
        onSuccess: () => {
          setRoleDrawerOpen(false);
          setChangeRoleState(null);
        },
      },
    );
  }

  function handleToggleLoginConfirm() {
    if (!toggleLoginState) return;
    toggleLoginMutation.mutate(
      {
        id: toggleLoginState.userId,
        input: { canLogin: !toggleLoginState.currentCanLogin },
      },
      {
        onSuccess: () => {
          setToggleLoginState(null);
        },
      },
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Пользователи"
        subtitle="Управление сотрудниками"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "users", label: "Пользователи" },
        ]}
        actions={
          <AppButton
            label="Добавить пользователя"
            variant="primary"
            size="md"
            onClick={() => {
              setCreateForm(INITIAL_CREATE_FORM);
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
          description="Не удалось загрузить список пользователей. Попробуйте обновить страницу."
        />
      )}

      {!isLoading && !isError && (
        <AppDataTable
          columns={columns}
          data={users}
          rowKey={(row) => row.id}
          rowActions={getRowActions}
          rowActionsTriggerLabel="Действия"
          searchPlaceholder="Поиск по имени или email..."
          enableSettings
          storageKey="settings-users-table"
        />
      )}

      {/* Create user drawer */}
      <AppDrawerForm
        open={createDrawerOpen}
        title="Добавить пользователя"
        subtitle="Заполните данные нового сотрудника"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={
          !createForm.fullName.trim() ||
          !createForm.email.trim() ||
          createForm.password.length < 8 ||
          createMutation.isPending
        }
        onClose={() => setCreateDrawerOpen(false)}
        onSave={handleCreateSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label="ФИО *"
            value={createForm.fullName}
            onChangeValue={(v) => setCreateForm((prev) => ({ ...prev, fullName: v }))}
            placeholder="Иван Иванов"
          />
          <AppInput
            label="Email *"
            type="email"
            value={createForm.email}
            onChangeValue={(v) => setCreateForm((prev) => ({ ...prev, email: v }))}
            placeholder="ivan@example.com"
          />
          <AppInput
            label="Пароль * (мин. 8 символов)"
            type="password"
            value={createForm.password}
            onChangeValue={(v) => setCreateForm((prev) => ({ ...prev, password: v }))}
            placeholder="Минимум 8 символов"
          />
          <AppSelect
            label="Роль *"
            id="create-user-role"
            options={ROLE_OPTIONS}
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

      {/* Change role drawer */}
      <AppDrawerForm
        open={roleDrawerOpen}
        title={`Изменить роль: ${changeRoleState?.userName ?? ""}`}
        subtitle="Выберите новую роль для пользователя"
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
          <AppSelect
            label="Роль *"
            id="change-user-role"
            options={ROLE_OPTIONS}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as BackendRole)}
          />
        </Box>
      </AppDrawerForm>

      {/* Confirm toggle can_login */}
      <ConfirmDialog
        open={toggleLoginState !== null}
        title={
          toggleLoginState?.currentCanLogin
            ? "Заблокировать доступ"
            : "Разрешить доступ"
        }
        message={
          toggleLoginState?.currentCanLogin
            ? `Пользователь ${toggleLoginState.userName} будет заблокирован и не сможет войти в систему.`
            : `Пользователь ${toggleLoginState?.userName ?? ""} снова сможет войти в систему.`
        }
        confirmText={toggleLoginState?.currentCanLogin ? "Заблокировать" : "Разрешить"}
        cancelText="Отмена"
        destructive={toggleLoginState?.currentCanLogin === true}
        onConfirm={handleToggleLoginConfirm}
        onClose={() => setToggleLoginState(null)}
      />
    </main>
  );
}
