"use client";

import { useState } from "react";
import { Box, Stack } from "@mui/material";
import {
  type AppActionMenuGroup,
  AppButton,
  AppDataTable,
  type AppDataTableColumn,
  AppDrawerForm,
  AppInput,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { usePayableRemindersQuery } from "@/modules/finance/presentation/hooks/use-payable-reminders-query";
import { useCreatePayableReminderMutation } from "@/modules/finance/presentation/hooks/use-create-payable-reminder-mutation";
import { useMarkReminderPaidMutation } from "@/modules/finance/presentation/hooks/use-mark-reminder-paid-mutation";
import { useCancelReminderMutation } from "@/modules/finance/presentation/hooks/use-cancel-reminder-mutation";
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import type {
  PayableReminder,
  PayeeType,
  ReminderStatus,
  PayableReminderListParams,
} from "@/modules/finance/domain/finance";
import { usePropertyContext } from "@/shared/providers/property-provider";
import { useI18n } from "@/shared/providers/locale-provider";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TONE: Record<ReminderStatus, AppStatusTone> = {
  pending: "warning",
  paid: "success",
  cancelled: "muted",
};


// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(reminder: PayableReminder): boolean {
  const dueTime = Date.parse(reminder.dueDate);
  if (!Number.isFinite(dueTime)) {
    return false;
  }
  return reminder.status === "pending" && dueTime < Date.now();
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface CreateFormState {
  payeeType: PayeeType;
  payeeName: string;
  amount: string;
  currency: string;
  dueDate: string;
  description: string;
}

const INITIAL_FORM: CreateFormState = {
  payeeType: "supplier",
  payeeName: "",
  amount: "",
  currency: "TJS",
  dueDate: todayIso(),
  description: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PayableRemindersPage() {
  const { locale, t } = useI18n();
  const currencyOptions = useCurrencyOptions();
  const { currentPropertyId } = usePropertyContext();
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPayeeType, setFilterPayeeType] = useState<string>("");

  const params: PayableReminderListParams = {
    limit: 100,
    ...(currentPropertyId ? { propertyId: currentPropertyId } : {}),
    ...(filterStatus ? { status: filterStatus as ReminderStatus } : {}),
    ...(filterPayeeType ? { payeeType: filterPayeeType as PayeeType } : {}),
  };

  const { data: reminders, isLoading, isError } = usePayableRemindersQuery(params);
  const createMutation = useCreatePayableReminderMutation();
  const markPaidMutation = useMarkReminderPaidMutation();
  const cancelMutation = useCancelReminderMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);

  const payeeTypeLabel: Record<PayeeType, string> = {
    supplier: t("finance.reminders.payee.supplier"),
    contractor: t("finance.reminders.payee.contractor"),
    master: t("finance.reminders.payee.master"),
    other: t("finance.reminders.payee.other"),
  };

  const statusLabel: Record<ReminderStatus, string> = {
    pending: t("finance.reminders.status.pending"),
    paid: t("finance.reminders.status.paid"),
    cancelled: t("finance.reminders.status.cancelled"),
  };

  const statusFilterOptions = [
    { value: "", label: t("finance.reminders.filters.allStatuses") },
    { value: "pending", label: t("finance.reminders.status.pending") },
    { value: "paid", label: t("finance.reminders.status.paid") },
    { value: "cancelled", label: t("finance.reminders.status.cancelled") },
  ] as const;

  const payeeTypeFilterOptions = [
    { value: "", label: t("finance.reminders.filters.allTypes") },
    { value: "supplier", label: t("finance.reminders.payee.supplier") },
    { value: "contractor", label: t("finance.reminders.payee.contractor") },
    { value: "master", label: t("finance.reminders.payee.master") },
    { value: "other", label: t("finance.reminders.payee.other") },
  ] as const;

  const payeeTypeOptions = [
    { value: "supplier" as PayeeType, label: t("finance.reminders.payee.supplier") },
    { value: "contractor" as PayeeType, label: t("finance.reminders.payee.contractor") },
    { value: "master" as PayeeType, label: t("finance.reminders.payee.master") },
    { value: "other" as PayeeType, label: t("finance.reminders.payee.other") },
  ] as const;

  // Sort: by due_date ascending (closest first), overdue on top
  const sortedReminders = [...(reminders ?? [])].sort((a, b) => {
    const aOverdue = isOverdue(a) ? 0 : 1;
    const bOverdue = isOverdue(b) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    const aDue = typeof a.dueDate === "string" ? a.dueDate : "";
    const bDue = typeof b.dueDate === "string" ? b.dueDate : "";
    return aDue.localeCompare(bDue);
  });

  const overdueCount = (reminders ?? []).filter(isOverdue).length;

  const columns: readonly AppDataTableColumn<PayableReminder>[] = [
    {
      id: "dueDate",
      header: t("finance.reminders.columns.dueDate"),
      cell: (row) => (
        <span style={{ color: isOverdue(row) ? "var(--color-danger, #dc2626)" : undefined, fontWeight: isOverdue(row) ? 700 : undefined }}>
          {row.dueDate}
          {isOverdue(row) ? ` (${t("finance.reminders.overdueMark")})` : ""}
        </span>
      ),
      sortAccessor: (row) => row.dueDate,
    },
    {
      id: "payeeName",
      header: t("finance.reminders.columns.payeeName"),
      cell: (row) => row.payeeName,
      searchAccessor: (row) => row.payeeName,
      sortAccessor: (row) => row.payeeName,
    },
    {
      id: "payeeType",
      header: t("finance.reminders.columns.payeeType"),
      cell: (row) => payeeTypeLabel[row.payeeType],
      sortAccessor: (row) => row.payeeType,
    },
    {
      id: "amount",
      header: t("finance.reminders.columns.amount"),
      cell: (row) => (
        <span style={{ fontWeight: 600 }}>
          {`${row.amount.toLocaleString(locale === "en" ? "en-US" : "ru-RU")} ${row.currency}`}
        </span>
      ),
      sortAccessor: (row) => row.amount,
      align: "right",
    },
    {
      id: "description",
      header: t("finance.reminders.columns.description"),
      cell: (row) => row.description,
      searchAccessor: (row) => row.description,
    },
    {
      id: "status",
      header: t("finance.reminders.columns.status"),
      cell: (row) => (
        <AppStatusBadge label={statusLabel[row.status]} tone={STATUS_TONE[row.status]} />
      ),
      sortAccessor: (row) => row.status,
    },
  ];

  function buildRowActions(row: PayableReminder): readonly AppActionMenuGroup[] {
    if (row.status !== "pending") return [];
    return [
      {
        id: "actions",
        items: [
          {
            id: "mark-paid",
            label: t("finance.reminders.actions.markPaid"),
            onClick: () => markPaidMutation.mutate({ id: row.id, amount: row.amount }),
          },
          {
            id: "cancel",
            label: t("finance.reminders.actions.cancel"),
            destructive: true,
            onClick: () => cancelMutation.mutate(row.id),
          },
        ],
      },
    ];
  }

  function handleOpen() {
    setForm(INITIAL_FORM);
    setDrawerOpen(true);
  }

  function handleClose() {
    setDrawerOpen(false);
  }

  function handleSave() {
    const amount = parseFloat(form.amount);
    if (!form.payeeName.trim() || !form.amount || isNaN(amount) || amount <= 0) return;
    if (!form.description.trim() || !form.dueDate) return;

    createMutation.mutate(
      {
        payeeType: form.payeeType,
        payeeName: form.payeeName.trim(),
        amount,
        currency: form.currency,
        dueDate: form.dueDate,
        description: form.description.trim(),
      },
      {
        onSuccess: () => {
          setDrawerOpen(false);
          setForm(INITIAL_FORM);
        },
      },
    );
  }

  const isSaveDisabled =
    !form.payeeName.trim() ||
    !form.amount ||
    isNaN(parseFloat(form.amount)) ||
    parseFloat(form.amount) <= 0 ||
    !form.description.trim() ||
    !form.dueDate ||
    createMutation.isPending;

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={t("finance.reminders.title")}
        {...(overdueCount > 0
          ? { subtitle: t("finance.reminders.subtitle.overdue", { count: overdueCount }) }
          : reminders
            ? { subtitle: t("finance.reminders.subtitle.total", { count: reminders.length }) }
            : {})}
        breadcrumbs={[
          { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "finance", label: t("nav.finance"), href: routes.finance },
          { id: "payable-reminders", label: t("finance.reminders.breadcrumb") },
        ]}
        actions={
          <AppButton
            label={t("finance.reminders.addButton")}
            variant="primary"
            size="md"
            onClick={handleOpen}
          />
        }
      />

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Box sx={{ minWidth: 160 }}>
          <AppSelect
            label={t("finance.reminders.filters.status")}
            id="filter-status"
            options={statusFilterOptions}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: 160 }}>
          <AppSelect
            label={t("finance.reminders.filters.payeeType")}
            id="filter-payee-type"
            options={payeeTypeFilterOptions}
            value={filterPayeeType}
            onChange={(e) => setFilterPayeeType(e.target.value)}
          />
        </Box>
      </Stack>

      {/* Error */}
      {isError && (
        <AppStatePanel
          tone="error"
          title={t("finance.reminders.error.title")}
          description={t("finance.reminders.error.description")}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <AppStatePanel tone="empty" title={t("common.loading")} description={t("finance.reminders.loading")} />
      )}

      {/* Empty */}
      {!isLoading && !isError && sortedReminders.length === 0 && (
        <AppStatePanel
          tone="empty"
          title={t("finance.reminders.empty.title")}
          description={t("finance.reminders.empty.description")}
        />
      )}

      {/* Table */}
      {!isLoading && !isError && sortedReminders.length > 0 && (
        <AppDataTable<PayableReminder>
          data={sortedReminders}
          columns={columns}
          rowKey={(row) => row.id}
          title={t("finance.reminders.title")}
          searchPlaceholder={t("finance.reminders.searchPlaceholder")}
          rowActions={buildRowActions}
          enableSettings
        />
      )}

      {/* Create drawer */}
      <AppDrawerForm
        open={drawerOpen}
        title={t("finance.reminders.drawer.title")}
        subtitle={t("finance.reminders.drawer.subtitle")}
        saveLabel={t("finance.reminders.drawer.create")}
        cancelLabel={t("common.cancel")}
        isSaving={createMutation.isPending}
        saveDisabled={isSaveDisabled}
        onClose={handleClose}
        onSave={handleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppSelect
            label={t("finance.reminders.fields.payeeType")}
            id="reminder-payee-type"
            options={payeeTypeOptions}
            value={form.payeeType}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, payeeType: e.target.value as PayeeType }))
            }
          />
          <AppInput
            label={t("finance.reminders.fields.payeeName")}
            value={form.payeeName}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, payeeName: v }))}
            placeholder={t("finance.reminders.placeholders.payeeName")}
          />
          <AppInput
            label={t("finance.reminders.fields.amount")}
            type="number"
            value={form.amount}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, amount: v }))}
            placeholder="0.00"
          />
          <AppSelect
            label={t("finance.reminders.fields.currency")}
            id="reminder-currency"
            options={currencyOptions}
            value={form.currency}
            onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
          />
          <AppInput
            label={t("finance.reminders.fields.dueDate")}
            type="date"
            value={form.dueDate}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, dueDate: v }))}
          />
          <AppInput
            label={t("finance.reminders.fields.description")}
            value={form.description}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, description: v }))}
            placeholder={t("finance.reminders.placeholders.description")}
          />
        </Box>
      </AppDrawerForm>
    </main>
  );
}
