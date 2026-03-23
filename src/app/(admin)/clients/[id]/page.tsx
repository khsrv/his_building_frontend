"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Grid, Typography } from "@mui/material";
import {
  AppPageHeader,
  AppStatusBadge,
  AppDataTable,
  AppCommentThread,
  AppTabs,
  AppButton,
  AppSelect,
  AppStatCard,
  AppStatePanel,
  AppDrawerForm,
  ShimmerBox,
  type AppDataTableColumn,
  type AppComment,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useClientDetailQuery } from "@/modules/clients/presentation/hooks/use-client-detail-query";
import { useClientInteractionsQuery } from "@/modules/clients/presentation/hooks/use-client-interactions-query";
import { useAssignManagerMutation } from "@/modules/clients/presentation/hooks/use-assign-manager-mutation";
import { EditClientDrawer } from "@/modules/clients/presentation/components/edit-client-drawer";
import { AddInteractionDrawer } from "@/modules/clients/presentation/components/add-interaction-drawer";
import { useAddInteractionMutation } from "@/modules/clients/presentation/hooks/use-add-interaction-mutation";
import { useDealsListQuery } from "@/modules/deals/presentation/hooks/use-deals-list-query";
import { useClientPaymentsQuery } from "@/modules/deals/presentation/hooks/use-client-payments-query";
import { useDealScheduleQuery } from "@/modules/deals/presentation/hooks/use-deal-schedule-query";
import { ReceivePaymentDrawer } from "@/modules/deals/presentation/components/receive-payment-drawer";
import type { Interaction, ClientSource } from "@/modules/clients/domain/client";
import type { Deal } from "@/modules/deals/domain/deal";
import type { Payment } from "@/modules/deals/infrastructure/repository";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<ClientSource, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  website: "Сайт",
  referral: "Рекомендация",
  direct: "Прямой",
  other: "Другое",
};

const INTERACTION_TYPE_LABEL: Record<Interaction["type"], string> = {
  call: "Звонок",
  meeting: "Встреча",
  message: "Сообщение",
  email: "Email",
  other: "Другое",
};

const DEAL_STATUS_LABEL: Record<Deal["status"], string> = {
  draft: "Черновик",
  active: "Активная",
  completed: "Завершена",
  cancelled: "Отменена",
};

const DEAL_STATUS_TONE: Record<Deal["status"], AppStatusTone> = {
  draft: "muted",
  active: "success",
  completed: "info",
  cancelled: "danger",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Наличные",
  bank_transfer: "Банковский перевод",
  mobile: "Мобильный",
  barter: "Бартер",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждён",
  rejected: "Отклонён",
};

const PAYMENT_STATUS_TONE: Record<string, AppStatusTone> = {
  pending: "warning",
  confirmed: "success",
  rejected: "danger",
};

function fmtMoney(v: number, currency = "USD"): string {
  if (!v) return "—";
  const sym = currency === "USD" ? "$" : currency;
  return `${sym}${v.toLocaleString("ru-RU")}`;
}

// ─── Deals Tab ───────────────────────────────────────────────────────────────

function DealsTab({ clientId }: { clientId: string }) {
  const router = useRouter();
  const { data: deals, isLoading, isError } = useDealsListQuery({ clientId });

  const columns: readonly AppDataTableColumn<Deal>[] = [
    {
      id: "dealNumber",
      header: "Номер",
      cell: (row) => row.dealNumber,
      sortAccessor: (row) => row.dealNumber,
    },
    {
      id: "unit",
      header: "Квартира",
      cell: (row) => row.unitNumber || row.unitId.slice(0, 8),
    },
    {
      id: "status",
      header: "Статус",
      cell: (row) => (
        <AppStatusBadge label={DEAL_STATUS_LABEL[row.status]} tone={DEAL_STATUS_TONE[row.status]} />
      ),
    },
    {
      id: "finalAmount",
      header: "Сумма",
      cell: (row) => fmtMoney(row.finalAmount, row.currency),
      sortAccessor: (row) => row.finalAmount,
      align: "right",
    },
    {
      id: "paidAmount",
      header: "Оплачено",
      cell: (row) => (
        <span className={row.paidAmount > 0 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
          {fmtMoney(row.paidAmount, row.currency)}
        </span>
      ),
      sortAccessor: (row) => row.paidAmount,
      align: "right",
    },
    {
      id: "debtAmount",
      header: "Долг",
      cell: (row) => (
        <span className={row.debtAmount > 0 ? "text-red-600 font-semibold" : "text-muted-foreground"}>
          {fmtMoney(row.debtAmount, row.currency)}
        </span>
      ),
      sortAccessor: (row) => row.debtAmount,
      align: "right",
    },
    {
      id: "createdAt",
      header: "Дата",
      cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
      sortAccessor: (row) => row.createdAt,
    },
  ];

  if (isError) {
    return <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить сделки" />;
  }

  return (
    <AppDataTable<Deal>
      title={`Сделки (${deals?.length ?? 0})`}
      data={deals ?? []}
      columns={columns}
      rowKey={(row) => row.id}
      enableSelection={false}
      enableExport={false}
      enableSettings={false}
      onRowClick={(row) => router.push(routes.dealDetail(row.id))}
    />
  );
}

// ─── Payments Tab ────────────────────────────────────────────────────────────

function PaymentsTab({ clientId }: { clientId: string }) {
  const { data: payments, isLoading } = useClientPaymentsQuery(clientId);

  const columns: readonly AppDataTableColumn<Payment>[] = [
    {
      id: "createdAt",
      header: "Дата",
      cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
      sortAccessor: (row) => row.createdAt,
    },
    {
      id: "amount",
      header: "Сумма",
      cell: (row) => (
        <span className="font-semibold">{fmtMoney(row.amount, row.currency)}</span>
      ),
      sortAccessor: (row) => row.amount,
      align: "right",
    },
    {
      id: "method",
      header: "Способ",
      cell: (row) => PAYMENT_METHOD_LABEL[row.paymentMethod] ?? row.paymentMethod,
    },
    {
      id: "status",
      header: "Статус",
      cell: (row) => (
        <AppStatusBadge
          label={PAYMENT_STATUS_LABEL[row.status] ?? row.status}
          tone={PAYMENT_STATUS_TONE[row.status] ?? "muted"}
        />
      ),
    },
    {
      id: "notes",
      header: "Примечание",
      cell: (row) => row.notes ?? "—",
    },
  ];

  if (isLoading) return <ShimmerBox className="h-40 w-full rounded-xl" />;

  return (
    <AppDataTable<Payment>
      title={`История оплат (${payments?.length ?? 0})`}
      data={payments ?? []}
      columns={columns}
      rowKey={(row) => row.id}
      enableSelection={false}
      enableExport={false}
      enableSettings={false}
    />
  );
}

// ─── Interactions Tab ────────────────────────────────────────────────────────

function InteractionsTab({ clientId }: { clientId: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: interactions, isLoading } = useClientInteractionsQuery(clientId);
  const addMutation = useAddInteractionMutation(clientId);

  const comments: readonly AppComment[] = (interactions ?? []).map(
    (interaction): AppComment => ({
      id: interaction.id,
      authorId: interaction.id,
      authorName: interaction.createdByName,
      text: `[${INTERACTION_TYPE_LABEL[interaction.type]}] ${interaction.notes}${
        interaction.nextContactDate
          ? `\nСледующий контакт: ${new Date(interaction.nextContactDate).toLocaleDateString("ru-RU")}`
          : ""
      }`,
      createdAt: interaction.createdAt,
    }),
  );

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <AppButton
          label="Добавить взаимодействие"
          variant="primary"
          size="sm"
          onClick={() => setDrawerOpen(true)}
        />
      </Box>

      <AppCommentThread
        title="История взаимодействий"
        comments={comments}
        currentUserId="current"
        loading={isLoading}
        onSubmit={async (text) => {
          await addMutation.mutateAsync({
            type: "message",
            notes: text,
          });
        }}
      />

      <AddInteractionDrawer
        clientId={clientId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

// ─── Info Tab ────────────────────────────────────────────────────────────────

function InfoTab({ clientId }: { clientId: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const { data: client, isLoading, isError } = useClientDetailQuery(clientId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <ShimmerBox className="h-8 w-64 rounded" />
        <ShimmerBox className="h-8 w-48 rounded" />
      </div>
    );
  }

  if (isError || !client) {
    return <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить данные клиента" />;
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <AppButton label="Редактировать" variant="secondary" size="sm" onClick={() => setEditOpen(true)} />
      </Box>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoField label="ФИО" value={client.fullName} />
        <InfoField label="Телефон" value={client.phone} />
        {client.extraPhone ? <InfoField label="Доп. телефон" value={client.extraPhone} /> : null}
        {client.email ? <InfoField label="Email" value={client.email} /> : null}
        {client.whatsapp ? <InfoField label="WhatsApp" value={client.whatsapp} /> : null}
        {client.telegram ? <InfoField label="Telegram" value={client.telegram} /> : null}
        <InfoField label="Источник" value={SOURCE_LABEL[client.source]} />
        {client.address ? <InfoField label="Адрес" value={client.address} /> : null}
        {client.notes ? <InfoField label="Заметки" value={client.notes} /> : null}
      </div>

      <EditClientDrawer client={client} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const params = useParams();
  const id = params["id"] as string;

  const { data: client, isLoading } = useClientDetailQuery(id);
  const { data: deals } = useDealsListQuery({ clientId: id });

  // Payment drawer
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentDealId, setPaymentDealId] = useState("");

  const activeDeals = (deals ?? []).filter((d) => d.status === "active");

  // Auto-select deal if only one
  function handleOpenPayment() {
    if (activeDeals.length === 1) {
      setPaymentDealId(activeDeals[0]!.id);
    } else {
      setPaymentDealId("");
    }
    setPaymentOpen(true);
  }

  const selectedDeal = activeDeals.find((d) => d.id === paymentDealId);

  // KPI: prefer client-level aggregates from backend, fallback to deals data
  const allDeals = deals ?? [];
  const dealsCount = (client?.dealsCount || 0) > 0 ? client!.dealsCount : allDeals.length;
  const totalAmount = (client?.totalAmount || 0) > 0 ? client!.totalAmount : allDeals.reduce((s, d) => s + d.finalAmount, 0);
  const totalPaid = (client?.totalPaid || 0) > 0 ? client!.totalPaid : allDeals.reduce((s, d) => s + d.paidAmount, 0);
  const totalDebt = (client?.totalDebt || 0) > 0 ? client!.totalDebt : (totalAmount - totalPaid);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={isLoading ? "Загрузка..." : (client?.fullName ?? "Клиент")}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "clients", label: "Клиенты", href: routes.clients },
          { id: "detail", label: client?.fullName ?? "..." },
        ]}
        actions={
          activeDeals.length > 0 ? (
            <AppButton
              label="Принять платёж"
              variant="primary"
              onClick={handleOpenPayment}
            />
          ) : undefined
        }
      />

      {/* Client info row */}
      {client ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{client.phone}</span>
          {client.email ? <span>· {client.email}</span> : null}
          {client.address ? <span>· {client.address}</span> : null}
        </div>
      ) : null}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AppStatCard title="Сделки" value={String(dealsCount)} />
        <AppStatCard title="Сумма сделок" value={fmtMoney(totalAmount)} />
        <AppStatCard title="Оплачено" value={fmtMoney(totalPaid)} />
        <AppStatCard
          title="Долг"
          value={fmtMoney(totalDebt)}
          deltaTone={totalDebt > 0 ? "danger" : "success"}
        />
      </div>

      {/* Upcoming payments */}
      {activeDeals.length > 0 ? (
        <UpcomingPaymentsBlock deals={activeDeals} />
      ) : null}

      {/* Tabs — deals first */}
      <AppTabs
        initialTabId="deals"
        tabs={[
          {
            id: "deals",
            title: "Сделки",
            badge: dealsCount,
            content: <DealsTab clientId={id} />,
          },
          {
            id: "payments",
            title: "Оплаты",
            content: <PaymentsTab clientId={id} />,
          },
          {
            id: "interactions",
            title: "Взаимодействия",
            content: <InteractionsTab clientId={id} />,
          },
          {
            id: "info",
            title: "Информация",
            content: <InfoTab clientId={id} />,
          },
        ]}
      />

      {/* Payment drawer with deal selection */}
      {paymentOpen ? (
        paymentDealId && selectedDeal ? (
          <>
            <UpcomingPaymentInfo dealId={paymentDealId} currency={selectedDeal.currency} />
            <ReceivePaymentDrawer
              open
              dealId={paymentDealId}
              clientId={id}
              currency={selectedDeal.currency}
              onClose={() => setPaymentOpen(false)}
            />
          </>
        ) : (
          <DealSelectDrawer
            deals={activeDeals}
            open
            onSelect={(dealId) => setPaymentDealId(dealId)}
            onClose={() => setPaymentOpen(false)}
          />
        )
      ) : null}
    </div>
  );
}

// ─── Deal Select Drawer ──────────────────────────────────────────────────────

function DealSelectDrawer({
  deals,
  open,
  onSelect,
  onClose,
}: {
  deals: readonly Deal[];
  open: boolean;
  onSelect: (dealId: string) => void;
  onClose: () => void;
}) {
  return (
    <AppDrawerForm
      open={open}
      title="Выберите сделку"
      subtitle="У клиента несколько активных сделок"
      cancelLabel="Отмена"
      onClose={onClose}
      onSave={() => {}}
      saveLabel=""
      isSaving={false}
    >
      <div className="space-y-2">
        {deals.map((deal) => (
          <button
            key={deal.id}
            type="button"
            className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
            onClick={() => onSelect(deal.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{deal.dealNumber}</span>
              <AppStatusBadge label={DEAL_STATUS_LABEL[deal.status]} tone={DEAL_STATUS_TONE[deal.status]} />
            </div>
            {(deal.propertyName || deal.unitNumber) ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {[deal.propertyName, deal.unitNumber ? `кв. ${deal.unitNumber}` : ""].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Сумма: {fmtMoney(deal.finalAmount, deal.currency)}</span>
              {deal.debtAmount > 0 ? (
                <span className="text-red-600 font-medium">Долг: {fmtMoney(deal.debtAmount, deal.currency)}</span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </AppDrawerForm>
  );
}

// ─── Upcoming Payment Info ───────────────────────────────────────────────────

function UpcomingPaymentInfo({ dealId, currency }: { dealId: string; currency: string }) {
  const { data: schedule } = useDealScheduleQuery(dealId);

  const nextPayment = (schedule ?? [])
    .filter((s) => s.status === "pending" || s.status === "partial" || s.status === "overdue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  if (!nextPayment) return null;

  const isOverdue = nextPayment.status === "overdue";

  return (
    <div className={`fixed bottom-20 right-6 z-50 max-w-xs rounded-xl border p-4 shadow-lg ${isOverdue ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {isOverdue ? "Просрочен" : "Ближайший платёж"}
      </p>
      <p className="mt-1 text-lg font-bold">
        {fmtMoney(nextPayment.remaining, currency)}
      </p>
      <p className="text-sm text-muted-foreground">
        до {new Date(nextPayment.dueDate).toLocaleDateString("ru-RU")}
      </p>
    </div>
  );
}

// ─── Upcoming Payments Block ─────────────────────────────────────────────────

function UpcomingPaymentsBlock({ deals }: { deals: readonly Deal[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Ближайшие платежи
      </h3>
      <div className="space-y-3">
        {deals.map((deal) => (
          <UpcomingPaymentRow key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}

function UpcomingPaymentRow({ deal }: { deal: Deal }) {
  const { data: schedule, isLoading } = useDealScheduleQuery(deal.id);

  const nextPayment = (schedule ?? [])
    .filter((s) => s.status === "pending" || s.status === "partial" || s.status === "overdue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
        <ShimmerBox className="h-5 w-24 rounded" />
        <ShimmerBox className="h-5 w-32 rounded" />
      </div>
    );
  }

  if (!nextPayment) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3 text-sm">
        <span className="text-muted-foreground">{deal.dealNumber}</span>
        <span className="text-emerald-600 font-medium">Нет предстоящих</span>
      </div>
    );
  }

  const isOverdue = nextPayment.status === "overdue";
  const borderColor = isOverdue ? "border-red-300" : "border-amber-300";
  const bgColor = isOverdue ? "bg-red-50" : "bg-amber-50";

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm">{deal.dealNumber}</span>
        {deal.unitNumber ? (
          <span className="text-xs text-muted-foreground">кв. {deal.unitNumber}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Сумма: </span>
          <span className="font-bold">{fmtMoney(nextPayment.remaining, deal.currency)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">до </span>
          <span className={`font-semibold ${isOverdue ? "text-red-600" : ""}`}>
            {new Date(nextPayment.dueDate).toLocaleDateString("ru-RU")}
          </span>
        </div>
        {isOverdue ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            Просрочено
          </span>
        ) : null}
      </div>
    </div>
  );
}
