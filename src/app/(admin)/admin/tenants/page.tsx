"use client";

import { useState } from "react";
import { Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import {
  AppPageHeader,
  AppButton,
  AppDataTable,
  AppDrawerForm,
  AppInput,
  AppStatusBadge,
  AppStatePanel,
  ShimmerBox,
  ConfirmDialog,
} from "@/shared/ui";
import type { AppDataTableColumn } from "@/shared/ui/primitives/data-table/types";
import type { AppActionMenuGroup } from "@/shared/ui/primitives/action-menu";
import { routes } from "@/shared/constants/routes";
import { useTenantsListQuery } from "@/modules/admin/presentation/hooks/use-tenants-list-query";
import { AppSelect } from "@/shared/ui";
import { useCreateTenantMutation } from "@/modules/admin/presentation/hooks/use-create-tenant-mutation";
import { useCreateTenantUserMutation } from "@/modules/admin/presentation/hooks/use-create-tenant-user-mutation";
import { useTenantActionsMutation } from "@/modules/admin/presentation/hooks/use-tenant-actions-mutation";
import type { Tenant, BackendRole } from "@/modules/admin/domain/admin";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU");
  } catch {
    return dateStr;
  }
}

type SubscriptionStatus = "active" | "trial" | "expiring" | "expired" | "none";

function getSubscriptionStatus(tenant: Tenant): SubscriptionStatus {
  const now = new Date();
  if (tenant.trialEndsAt) {
    const trial = new Date(tenant.trialEndsAt);
    if (trial > now) return "trial";
  }
  if (tenant.subscriptionExpiresAt) {
    const exp = new Date(tenant.subscriptionExpiresAt);
    if (exp <= now) return "expired";
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86_400_000);
    if (daysLeft <= 7) return "expiring";
    return "active";
  }
  return "none";
}

function SubscriptionStatusChip({ tenant }: { tenant: Tenant }) {
  const status = getSubscriptionStatus(tenant);
  const map: Record<SubscriptionStatus, { label: string; color: "success" | "warning" | "error" | "default" }> = {
    active:   { label: "Активна",       color: "success" },
    trial:    { label: "Пробный",        color: "default" },
    expiring: { label: "Истекает",       color: "warning" },
    expired:  { label: "Просрочена",     color: "error" },
    none:     { label: "Нет подписки",   color: "default" },
  };
  const { label, color } = map[status];
  return <Chip label={label} color={color} size="small" />;
}

// ─── State types ──────────────────────────────────────────────────────────────

interface TenantConfirmState {
  tenantId: string;
  tenantName: string;
  action: "activate" | "deactivate";
}

interface SubscriptionDialogState {
  tenantId: string;
  tenantName: string;
  currentMaxObjects: number;
  currentMaxUsers: number;
}

interface CreateFormState {
  name: string;
  slug: string;
}

const INITIAL_CREATE_FORM: CreateFormState = { name: "", slug: "" };

interface SubscriptionFormState {
  plan: string;
  expiresAt: string;
  maxObjects: string;
  maxUsers: string;
}

const INITIAL_SUB_FORM: SubscriptionFormState = {
  plan: "starter",
  expiresAt: "",
  maxObjects: "1",
  maxUsers: "5",
};

interface CreateUserFormState {
  email: string;
  password: string;
  fullName: string;
  role: BackendRole;
}

const INITIAL_USER_FORM: CreateUserFormState = {
  email: "",
  password: "",
  fullName: "",
  role: "company_admin",
};

const ROLE_OPTIONS: { value: BackendRole; label: string }[] = [
  { value: "company_admin", label: "Администратор компании" },
  { value: "sales_head", label: "Начальник продаж" },
  { value: "manager", label: "Менеджер" },
  { value: "accountant", label: "Бухгалтер" },
  { value: "cashier", label: "Кассир" },
];

const PLAN_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "business", label: "Business" },
  { value: "corporate", label: "Corporate" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTenantsPage() {
  const { data, isLoading, isError } = useTenantsListQuery({ limit: 100 });
  const createMutation = useCreateTenantMutation();
  const createUserMutation = useCreateTenantUserMutation();
  const actionsMutation = useTenantActionsMutation();

  // Create drawer
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(INITIAL_CREATE_FORM);

  // Confirm activate/deactivate
  const [confirmState, setConfirmState] = useState<TenantConfirmState | null>(null);

  // Subscription dialog
  const [subDialogState, setSubDialogState] = useState<SubscriptionDialogState | null>(null);
  const [subForm, setSubForm] = useState<SubscriptionFormState>(INITIAL_SUB_FORM);

  // Create user drawer
  const [userDrawerTenant, setUserDrawerTenant] = useState<{ id: string; name: string } | null>(null);
  const [userForm, setUserForm] = useState<CreateUserFormState>(INITIAL_USER_FORM);
  const [userErrors, setUserErrors] = useState<Partial<Record<"email" | "password" | "fullName", string>>>({});

  const tenants = data?.items ?? [];

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columns: readonly AppDataTableColumn<Tenant>[] = [
    {
      id: "name",
      header: "Название",
      cell: (row) => row.name,
      searchAccessor: (row) => row.name,
      sortAccessor: (row) => row.name,
    },
    {
      id: "slug",
      header: "Slug",
      cell: (row) => row.slug,
      searchAccessor: (row) => row.slug,
    },
    {
      id: "isActive",
      header: "Статус",
      cell: (row) => (
        <AppStatusBadge
          label={row.isActive ? "Активен" : "Деактивирован"}
          tone={row.isActive ? "success" : "danger"}
        />
      ),
    },
    {
      id: "subscription",
      header: "Подписка",
      cell: (row) => <SubscriptionStatusChip tenant={row} />,
    },
    {
      id: "plan",
      header: "Тариф",
      cell: (row) => row.plan ?? "—",
      sortAccessor: (row) => row.plan ?? "",
    },
    {
      id: "expiresAt",
      header: "Истекает",
      cell: (row) => formatDate(row.subscriptionExpiresAt),
      sortAccessor: (row) => row.subscriptionExpiresAt ?? "",
    },
    {
      id: "limits",
      header: "Объекты / Польз.",
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.maxObjects === 0 ? "∞" : row.maxObjects}
          {" / "}
          {row.maxUsers === 0 ? "∞" : row.maxUsers}
        </Typography>
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

  function getRowActions(row: Tenant): readonly AppActionMenuGroup[] {
    return [
      {
        id: "main",
        items: [
          {
            id: "toggle-active",
            label: row.isActive ? "Деактивировать" : "Активировать",
            onClick: () => {
              setConfirmState({
                tenantId: row.id,
                tenantName: row.name,
                action: row.isActive ? "deactivate" : "activate",
              });
            },
          },
          {
            id: "add-user",
            label: "Добавить пользователя",
            onClick: () => {
              setUserDrawerTenant({ id: row.id, name: row.name });
              setUserForm(INITIAL_USER_FORM);
              setUserErrors({});
            },
          },
          {
            id: "set-subscription",
            label: "Управление подпиской",
            onClick: () => {
              setSubDialogState({
                tenantId: row.id,
                tenantName: row.name,
                currentMaxObjects: row.maxObjects,
                currentMaxUsers: row.maxUsers,
              });
              setSubForm({
                plan: row.plan ?? "starter",
                expiresAt: "",
                maxObjects: String(row.maxObjects),
                maxUsers: String(row.maxUsers),
              });
            },
          },
        ],
      },
    ];
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const [createError, setCreateError] = useState("");

  function nameToSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || `tenant-${Date.now()}`
    );
  }

  function handleCreateSave() {
    const name = createForm.name.trim();
    if (!name || name.length < 2) {
      setCreateError("Введите название (минимум 2 символа)");
      return;
    }
    setCreateError("");

    const slug = nameToSlug(name);

    createMutation.mutate(
      { name, slug },
      {
        onSuccess: () => {
          setCreateDrawerOpen(false);
          setCreateForm(INITIAL_CREATE_FORM);
          setCreateError("");
        },
      },
    );
  }

  function handleConfirmAction() {
    if (!confirmState) return;
    actionsMutation.mutate(
      confirmState.action === "activate"
        ? { type: "activate", id: confirmState.tenantId }
        : { type: "deactivate", id: confirmState.tenantId },
      { onSuccess: () => setConfirmState(null) },
    );
  }

  function handleSubSave() {
    if (!subDialogState || !subForm.plan.trim() || !subForm.expiresAt) return;

    const maxObjects = Math.max(0, parseInt(subForm.maxObjects, 10) || 0);
    const maxUsers   = Math.max(0, parseInt(subForm.maxUsers, 10) || 0);

    // Build RFC3339 from date input value (YYYY-MM-DD → YYYY-MM-DDT23:59:59Z)
    const expiresAt = subForm.expiresAt.includes("T")
      ? subForm.expiresAt
      : `${subForm.expiresAt}T23:59:59Z`;

    actionsMutation.mutate(
      {
        type: "setSubscription",
        id: subDialogState.tenantId,
        input: {
          plan: subForm.plan.trim(),
          expiresAt,
          maxObjects,
          maxUsers,
        },
      },
      {
        onSuccess: () => {
          setSubDialogState(null);
          setSubForm(INITIAL_SUB_FORM);
        },
      },
    );
  }

  function handleCreateUserSave() {
    if (!userDrawerTenant) return;
    const nextErrors: typeof userErrors = {};
    if (!userForm.fullName.trim() || userForm.fullName.trim().length < 2) {
      nextErrors.fullName = "Минимум 2 символа";
    }
    if (!userForm.email.trim() || !userForm.email.includes("@")) {
      nextErrors.email = "Введите корректный email";
    }
    if (!userForm.password || userForm.password.length < 8) {
      nextErrors.password = "Минимум 8 символов";
    }
    setUserErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createUserMutation.mutate(
      {
        tenantId: userDrawerTenant.id,
        input: {
          email: userForm.email.trim(),
          password: userForm.password,
          fullName: userForm.fullName.trim(),
          role: userForm.role,
        },
      },
      {
        onSuccess: () => {
          setUserDrawerTenant(null);
          setUserForm(INITIAL_USER_FORM);
          setUserErrors({});
        },
      },
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Тенанты"
        subtitle="Управление компаниями-застройщиками"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "admin-tenants", label: "Тенанты" },
        ]}
        actions={
          <AppButton
            label="Создать тенант"
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
          description="Не удалось загрузить список тенантов. Попробуйте обновить страницу."
        />
      )}

      {!isLoading && !isError && (
        <AppDataTable
          columns={columns}
          data={tenants}
          rowKey={(row) => row.id}
          rowActions={getRowActions}
          rowActionsTriggerLabel="Действия"
          searchPlaceholder="Поиск по названию или slug..."
          enableSettings
          storageKey="admin-tenants-table"
        />
      )}

      {/* ── Create tenant drawer ── */}
      <AppDrawerForm
        open={createDrawerOpen}
        title="Создать застройщика"
        subtitle="Укажите название компании"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={!createForm.name.trim() || createForm.name.trim().length < 2 || createMutation.isPending}
        onClose={() => { setCreateDrawerOpen(false); setCreateError(""); }}
        onSave={handleCreateSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label="Название компании *"
            value={createForm.name}
            onChangeValue={(v) => { setCreateForm((prev) => ({ ...prev, name: v })); setCreateError(""); }}
            placeholder="ООО Строй Инвест"
            {...(createError ? { errorText: createError } : {})}
          />
        </Box>
      </AppDrawerForm>

      {/* ── Confirm activate/deactivate ── */}
      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.action === "activate" ? "Активировать тенант" : "Деактивировать тенант"}
        message={
          confirmState?.action === "activate"
            ? `Тенант "${confirmState.tenantName}" будет активирован.`
            : `Тенант "${confirmState?.tenantName ?? ""}" будет деактивирован. Пользователи не смогут войти.`
        }
        confirmText={confirmState?.action === "activate" ? "Активировать" : "Деактивировать"}
        cancelText="Отмена"
        destructive={confirmState?.action === "deactivate"}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmState(null)}
      />

      {/* ── Subscription management dialog ── */}
      <Dialog
        open={subDialogState !== null}
        onClose={() => setSubDialogState(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Управление подпиской — {subDialogState?.tenantName ?? ""}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <AppSelect
              id="sub-plan"
              label="Тариф *"
              options={PLAN_OPTIONS}
              value={subForm.plan}
              onChange={(e) => setSubForm((prev) => ({ ...prev, plan: e.target.value }))}
            />
            <AppInput
              label="Дата окончания подписки *"
              type="date"
              value={subForm.expiresAt}
              onChangeValue={(v) => setSubForm((prev) => ({ ...prev, expiresAt: v }))}
            />
            <AppInput
              label="Макс. объектов (0 = без ограничений)"
              type="number"
              value={subForm.maxObjects}
              onChangeValue={(v) => setSubForm((prev) => ({ ...prev, maxObjects: v }))}
              placeholder="1"
            />
            <AppInput
              label="Макс. пользователей (0 = без ограничений)"
              type="number"
              value={subForm.maxUsers}
              onChangeValue={(v) => setSubForm((prev) => ({ ...prev, maxUsers: v }))}
              placeholder="5"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton
            label="Отмена"
            variant="outline"
            onClick={() => setSubDialogState(null)}
          />
          <AppButton
            label="Сохранить"
            variant="primary"
            disabled={!subForm.plan.trim() || !subForm.expiresAt || actionsMutation.isPending}
            onClick={handleSubSave}
          />
        </DialogActions>
      </Dialog>

      {/* ── Create tenant user drawer ── */}
      <AppDrawerForm
        open={userDrawerTenant !== null}
        title="Добавить пользователя"
        subtitle={userDrawerTenant ? `Тенант: ${userDrawerTenant.name}` : ""}
        saveLabel="Создать пользователя"
        cancelLabel="Отмена"
        isSaving={createUserMutation.isPending}
        saveDisabled={createUserMutation.isPending}
        onClose={() => { setUserDrawerTenant(null); setUserErrors({}); }}
        onSave={handleCreateUserSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label="ФИО *"
            value={userForm.fullName}
            onChangeValue={(v) => { setUserForm((p) => ({ ...p, fullName: v })); setUserErrors((p) => { const n = { ...p }; delete n.fullName; return n; }); }}
            placeholder="Иванов Иван Иванович"
            {...(userErrors.fullName ? { errorText: userErrors.fullName } : {})}
          />
          <AppInput
            label="Email *"
            type="email"
            value={userForm.email}
            onChangeValue={(v) => { setUserForm((p) => ({ ...p, email: v })); setUserErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
            placeholder="admin@company.com"
            {...(userErrors.email ? { errorText: userErrors.email } : {})}
          />
          <AppInput
            label="Пароль *"
            type="password"
            value={userForm.password}
            onChangeValue={(v) => { setUserForm((p) => ({ ...p, password: v })); setUserErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
            placeholder="Минимум 8 символов"
            {...(userErrors.password ? { errorText: userErrors.password } : {})}
          />
          <AppSelect
            id="tenant-user-role"
            label="Роль *"
            options={ROLE_OPTIONS}
            value={userForm.role}
            onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as BackendRole }))}
          />
        </Box>
      </AppDrawerForm>
    </main>
  );
}
