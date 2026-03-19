"use client";

import { useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
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
import { useCreateTenantMutation } from "@/modules/admin/presentation/hooks/use-create-tenant-mutation";
import { useTenantActionsMutation } from "@/modules/admin/presentation/hooks/use-tenant-actions-mutation";
import type { Tenant } from "@/modules/admin/domain/admin";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU");
  } catch {
    return dateStr;
  }
}

// ─── Confirm action state ─────────────────────────────────────────────────────

interface TenantConfirmState {
  tenantId: string;
  tenantName: string;
  action: "activate" | "deactivate";
}

interface SubscriptionDialogState {
  tenantId: string;
  tenantName: string;
}

interface CreateFormState {
  name: string;
  slug: string;
}

const INITIAL_CREATE_FORM: CreateFormState = { name: "", slug: "" };

interface SubscriptionFormState {
  plan: string;
  expiresAt: string;
}

const INITIAL_SUB_FORM: SubscriptionFormState = { plan: "", expiresAt: "" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTenantsPage() {
  const { data, isLoading, isError } = useTenantsListQuery({ limit: 100 });
  const createMutation = useCreateTenantMutation();
  const actionsMutation = useTenantActionsMutation();

  // Create drawer
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(INITIAL_CREATE_FORM);

  // Confirm activate/deactivate
  const [confirmState, setConfirmState] = useState<TenantConfirmState | null>(null);

  // Subscription dialog
  const [subDialogState, setSubDialogState] = useState<SubscriptionDialogState | null>(null);
  const [subForm, setSubForm] = useState<SubscriptionFormState>(INITIAL_SUB_FORM);

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
      id: "plan",
      header: "Тариф",
      cell: (row) => row.plan ?? "—",
      sortAccessor: (row) => row.plan ?? "",
    },
    {
      id: "expiresAt",
      header: "Истекает",
      cell: (row) => formatDate(row.expiresAt),
      sortAccessor: (row) => row.expiresAt ?? "",
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
            id: "set-subscription",
            label: "Назначить тариф",
            onClick: () => {
              setSubDialogState({ tenantId: row.id, tenantName: row.name });
              setSubForm(INITIAL_SUB_FORM);
            },
          },
        ],
      },
    ];
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleCreateSave() {
    if (!createForm.name.trim() || !createForm.slug.trim()) return;
    createMutation.mutate(
      { name: createForm.name.trim(), slug: createForm.slug.trim() },
      {
        onSuccess: () => {
          setCreateDrawerOpen(false);
          setCreateForm(INITIAL_CREATE_FORM);
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
    actionsMutation.mutate(
      {
        type: "setSubscription",
        id: subDialogState.tenantId,
        input: { plan: subForm.plan.trim(), expiresAt: subForm.expiresAt },
      },
      {
        onSuccess: () => {
          setSubDialogState(null);
          setSubForm(INITIAL_SUB_FORM);
        },
      },
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Тенанты"
        subtitle="Управление компаниями"
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

      {/* Create tenant drawer */}
      <AppDrawerForm
        open={createDrawerOpen}
        title="Создать тенант"
        subtitle="Укажите название и slug новой компании"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={
          !createForm.name.trim() ||
          !createForm.slug.trim() ||
          createMutation.isPending
        }
        onClose={() => setCreateDrawerOpen(false)}
        onSave={handleCreateSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label="Название *"
            value={createForm.name}
            onChangeValue={(v) => setCreateForm((prev) => ({ ...prev, name: v }))}
            placeholder="ООО Строй Инвест"
          />
          <AppInput
            label="Slug *"
            value={createForm.slug}
            onChangeValue={(v) =>
              setCreateForm((prev) => ({
                ...prev,
                slug: v.toLowerCase().replace(/\s+/g, "-"),
              }))
            }
            placeholder="stroy-invest"
          />
        </Box>
      </AppDrawerForm>

      {/* Confirm activate/deactivate */}
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

      {/* Subscription dialog */}
      <Dialog
        open={subDialogState !== null}
        onClose={() => setSubDialogState(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Назначить тариф — {subDialogState?.tenantName ?? ""}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <AppInput
              label="Тариф *"
              value={subForm.plan}
              onChangeValue={(v) => setSubForm((prev) => ({ ...prev, plan: v }))}
              placeholder="basic / pro / enterprise"
            />
            <AppInput
              label="Дата окончания *"
              type="date"
              value={subForm.expiresAt}
              onChangeValue={(v) => setSubForm((prev) => ({ ...prev, expiresAt: v }))}
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
            disabled={
              !subForm.plan.trim() || !subForm.expiresAt || actionsMutation.isPending
            }
            onClick={handleSubSave}
          />
        </DialogActions>
      </Dialog>
    </main>
  );
}
