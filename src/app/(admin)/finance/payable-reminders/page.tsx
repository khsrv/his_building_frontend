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

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYEE_TYPE_LABEL: Record<PayeeType, string> = {
  supplier: "Поставщик",
  contractor: "Подрядчик",
  master: "Мастер",
  other: "Другое",
};

const STATUS_LABEL: Record<ReminderStatus, string> = {
  pending: "Ожидает",
  paid: "Оплачено",
  cancelled: "Отменено",
};

const STATUS_TONE: Record<ReminderStatus, AppStatusTone> = {
  pending: "warning",
  paid: "success",
  cancelled: "muted",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Все статусы" },
  { value: "pending", label: "Ожидает" },
  { value: "paid", label: "Оплачено" },
  { value: "cancelled", label: "Отменено" },
] as const;

const PAYEE_TYPE_FILTER_OPTIONS = [
  { value: "", label: "Все типы" },
  { value: "supplier", label: "Поставщик" },
  { value: "contractor", label: "Подрядчик" },
  { value: "master", label: "Мастер" },
  { value: "other", label: "Другое" },
] as const;

const PAYEE_TYPE_OPTIONS = [
  { value: "supplier" as PayeeType, label: "Поставщик" },
  { value: "contractor" as PayeeType, label: "Подрядчик" },
  { value: "master" as PayeeType, label: "Мастер" },
  { value: "other" as PayeeType, label: "Другое" },
] as const;


// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(reminder: PayableReminder): boolean {
  const dueTime = Date.parse(reminder.dueDate);
  if (!Number.isFinite(dueTime)) {
    return false;
  }
  return reminder.status === "pending" && dueTime < Date.now();
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
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
      header: "Срок оплаты",
      cell: (row) => (
        <span style={{ color: isOverdue(row) ? "var(--color-danger, #dc2626)" : undefined, fontWeight: isOverdue(row) ? 700 : undefined }}>
          {row.dueDate}
          {isOverdue(row) ? " (!)" : ""}
        </span>
      ),
      sortAccessor: (row) => row.dueDate,
    },
    {
      id: "payeeName",
      header: "Кому",
      cell: (row) => row.payeeName,
      searchAccessor: (row) => row.payeeName,
      sortAccessor: (row) => row.payeeName,
    },
    {
      id: "payeeType",
      header: "Тип",
      cell: (row) => PAYEE_TYPE_LABEL[row.payeeType],
      sortAccessor: (row) => row.payeeType,
    },
    {
      id: "amount",
      header: "Сумма",
      cell: (row) => (
        <span style={{ fontWeight: 600 }}>{formatMoney(row.amount, row.currency)}</span>
      ),
      sortAccessor: (row) => row.amount,
      align: "right",
    },
    {
      id: "description",
      header: "Описание",
      cell: (row) => row.description,
      searchAccessor: (row) => row.description,
    },
    {
      id: "status",
      header: "Статус",
      cell: (row) => (
        <AppStatusBadge label={STATUS_LABEL[row.status]} tone={STATUS_TONE[row.status]} />
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
            label: "Оплачено",
            onClick: () => markPaidMutation.mutate({ id: row.id, amount: row.amount }),
          },
          {
            id: "cancel",
            label: "Отменить",
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
        title="Напоминалки по платежам"
        {...(overdueCount > 0
          ? { subtitle: `${overdueCount} просроченных платежей` }
          : reminders
            ? { subtitle: `${reminders.length} напоминаний` }
            : {})}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы", href: routes.finance },
          { id: "payable-reminders", label: "Напоминалки" },
        ]}
        actions={
          <AppButton
            label="Добавить напоминалку"
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
            label="Статус"
            id="filter-status"
            options={STATUS_FILTER_OPTIONS}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: 160 }}>
          <AppSelect
            label="Тип получателя"
            id="filter-payee-type"
            options={PAYEE_TYPE_FILTER_OPTIONS}
            value={filterPayeeType}
            onChange={(e) => setFilterPayeeType(e.target.value)}
          />
        </Box>
      </Stack>

      {/* Error */}
      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить список напоминаний. Попробуйте обновить страницу."
        />
      )}

      {/* Loading */}
      {isLoading && (
        <AppStatePanel tone="empty" title="Загрузка..." description="Загружаем список." />
      )}

      {/* Empty */}
      {!isLoading && !isError && sortedReminders.length === 0 && (
        <AppStatePanel
          tone="empty"
          title="Напоминания не найдены"
          description="Добавьте первое напоминание об оплате."
        />
      )}

      {/* Table */}
      {!isLoading && !isError && sortedReminders.length > 0 && (
        <AppDataTable<PayableReminder>
          data={sortedReminders}
          columns={columns}
          rowKey={(row) => row.id}
          title="Напоминалки по платежам"
          searchPlaceholder="Поиск по получателю или описанию..."
          rowActions={buildRowActions}
          enableSettings
        />
      )}

      {/* Create drawer */}
      <AppDrawerForm
        open={drawerOpen}
        title="Добавить напоминалку"
        subtitle="Заполните данные платежа"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={isSaveDisabled}
        onClose={handleClose}
        onSave={handleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppSelect
            label="Тип получателя *"
            id="reminder-payee-type"
            options={PAYEE_TYPE_OPTIONS}
            value={form.payeeType}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, payeeType: e.target.value as PayeeType }))
            }
          />
          <AppInput
            label="Кому *"
            value={form.payeeName}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, payeeName: v }))}
            placeholder="Имя поставщика / подрядчика"
          />
          <AppInput
            label="Сумма *"
            type="number"
            value={form.amount}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, amount: v }))}
            placeholder="0.00"
          />
          <AppSelect
            label="Валюта *"
            id="reminder-currency"
            options={currencyOptions}
            value={form.currency}
            onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
          />
          <AppInput
            label="Срок оплаты *"
            type="date"
            value={form.dueDate}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, dueDate: v }))}
          />
          <AppInput
            label="Описание *"
            value={form.description}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, description: v }))}
            placeholder="За что платим"
          />
        </Box>
      </AppDrawerForm>
    </main>
  );
}
