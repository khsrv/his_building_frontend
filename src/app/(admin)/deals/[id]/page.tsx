"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  AppPageHeader,
  AppButton,
  AppInput,
  AppStatCard,
  AppStatusBadge,
  AppPaymentTimeline,
  type AppPaymentInstallment,
  type AppPaymentStatus,
  AppStatePanel,
  AppTabs,
  ConfirmDialog,
  ShimmerBox,
} from "@/shared/ui";

// Local type matching AppTabs's TabSpec interface
interface DealTabSpec {
  id: string;
  title: string;
  content: ReactNode;
}
import { routes } from "@/shared/constants/routes";
import { useEnrichedDealDetailQuery } from "@/modules/deals/presentation/hooks/use-enriched-deal-detail-query";
import { useDealScheduleQuery } from "@/modules/deals/presentation/hooks/use-deal-schedule-query";
import { useDealPaymentsQuery } from "@/modules/deals/presentation/hooks/use-deal-payments-query";
import { useActivateDealMutation } from "@/modules/deals/presentation/hooks/use-activate-deal-mutation";
import { useCompleteDealMutation } from "@/modules/deals/presentation/hooks/use-complete-deal-mutation";
import { useCancelDealMutation } from "@/modules/deals/presentation/hooks/use-cancel-deal-mutation";
import { useUpdateScheduleItemMutation } from "@/modules/deals/presentation/hooks/use-update-schedule-item-mutation";
import { useConfirmPaymentMutation } from "@/modules/deals/presentation/hooks/use-confirm-payment-mutation";
import { useRejectPaymentMutation } from "@/modules/deals/presentation/hooks/use-reject-payment-mutation";
import { ReceivePaymentDrawer } from "@/modules/deals/presentation/components/receive-payment-drawer";
import type { ScheduleItem, ScheduleItemStatus, DealStatus, DealPaymentType } from "@/modules/deals/domain/deal";
import type { Payment } from "@/modules/deals/infrastructure/repository";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(amount: number, currency: string): string {
  return (
    new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
      amount,
    ) +
    " " +
    currency
  );
}

function mapScheduleStatusToTimeline(status: ScheduleItemStatus): AppPaymentStatus {
  switch (status) {
    case "paid":
      return "paid";
    case "overdue":
      return "overdue";
    case "partial":
      return "today";
    case "pending":
      return "upcoming";
    default:
      return "upcoming";
  }
}

const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  draft: "Черновик",
  active: "Активная",
  completed: "Завершена",
  cancelled: "Отменена",
};

const DEAL_STATUS_TONE: Record<
  DealStatus,
  "muted" | "info" | "success" | "danger"
> = {
  draft: "muted",
  active: "info",
  completed: "success",
  cancelled: "danger",
};

const PAYMENT_TYPE_LABEL: Record<DealPaymentType, string> = {
  full_payment: "Полная оплата",
  installment: "Рассрочка",
  mortgage: "Ипотека",
  barter: "Бартер",
  combined: "Комбинированная",
};

const PAYMENT_METHOD_LABEL: Record<Payment["paymentMethod"], string> = {
  cash: "Наличные",
  bank_transfer: "Банковский перевод",
  mobile: "Мобильный платёж",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealDetailPage() {
  const params = useParams();
  const id = params["id"] as string;
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [editScheduleItem, setEditScheduleItem] = useState<ScheduleItem | null>(null);
  const [editDueDate, setEditDueDate] = useState("");
  const [editPlannedAmount, setEditPlannedAmount] = useState("");
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null);
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null);

  const { data: deal, isLoading: dealLoading, error: dealError } = useEnrichedDealDetailQuery(id);
  const { data: schedule = [], isLoading: scheduleLoading } = useDealScheduleQuery(id);
  const { data: payments = [] } = useDealPaymentsQuery(id);

  const { mutate: activate, isPending: activating } = useActivateDealMutation();
  const { mutate: complete, isPending: completing } = useCompleteDealMutation();
  const { mutate: cancel, isPending: cancelling } = useCancelDealMutation();
  const updateScheduleMutation = useUpdateScheduleItemMutation(id);
  const confirmPaymentMutation = useConfirmPaymentMutation(id);
  const rejectPaymentMutation = useRejectPaymentMutation(id);

  if (dealLoading) {
    return (
      <div className="space-y-6 p-6">
        <ShimmerBox className="h-16 w-full rounded-xl" />
        <ShimmerBox className="h-40 w-full rounded-xl" />
        <ShimmerBox className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (dealError || !deal) {
    return (
      <div className="p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки сделки"
          description={
            dealError instanceof Error ? dealError.message : "Попробуйте обновить страницу"
          }
        />
      </div>
    );
  }

  const paidAmount = schedule.reduce((sum, item) => sum + item.paidAmount, 0);

  const installments: AppPaymentInstallment[] = schedule.map((item) => {
    const base = {
      id: item.id,
      dueDate: item.dueDate,
      amount: item.plannedAmount,
      currency: deal.currency,
      status: mapScheduleStatusToTimeline(item.status),
      label: `Платёж ${item.paymentNumber}`,
    };
    if (item.paidAmount > 0) {
      return { ...base, note: `Оплачено: ${formatMoney(item.paidAmount, deal.currency)}` };
    }
    return base;
  });

  const isDraft = deal.status === "draft";
  const isActive = deal.status === "active";
  const isCancelled = deal.status === "cancelled";
  const isCompleted = deal.status === "completed";

  // ─── Tab content ───────────────────────────────────────────────────────────

  const infoTabContent = (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Информация о сделке</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Номер сделки</p>
          <p className="text-sm font-medium text-foreground">{deal.dealNumber}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Статус</p>
          <div className="mt-0.5">
            <AppStatusBadge
              label={DEAL_STATUS_LABEL[deal.status]}
              tone={DEAL_STATUS_TONE[deal.status]}
            />
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Клиент</p>
          <p className="text-sm font-medium text-foreground">{deal.clientName}</p>
          <p className="text-xs text-muted-foreground">{deal.clientPhone}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Квартира</p>
          <p className="text-sm font-medium text-foreground">Кв. {deal.unitNumber}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">ЖК</p>
          <p className="text-sm font-medium text-foreground">{deal.propertyName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Тип оплаты</p>
          <p className="text-sm font-medium text-foreground">
            {PAYMENT_TYPE_LABEL[deal.paymentType]}
            {deal.installmentMonths ? ` (${deal.installmentMonths} мес.)` : ""}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Первоначальный взнос</p>
          <p className="text-sm font-medium text-foreground">
            {formatMoney(deal.downPayment, deal.currency)}
          </p>
        </div>
        {deal.discountAmount > 0 ? (
          <div>
            <p className="text-xs text-muted-foreground">Скидка</p>
            <p className="text-sm font-medium text-foreground">
              {formatMoney(deal.discountAmount, deal.currency)}
            </p>
          </div>
        ) : null}
        <div>
          <p className="text-xs text-muted-foreground">Менеджер</p>
          <p className="text-sm font-medium text-foreground">{deal.managerName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Дата создания</p>
          <p className="text-sm font-medium text-foreground">
            {new Date(deal.createdAt).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );

  const scheduleTabContent = scheduleLoading ? (
    <ShimmerBox className="h-64 w-full rounded-xl" />
  ) : schedule.length === 0 ? (
    <AppStatePanel
      tone="empty"
      title="График платежей не создан"
      description="График платежей будет сформирован после активации сделки"
    />
  ) : (
    <AppPaymentTimeline
      title="График платежей"
      installments={installments}
      showProgress
      onInstallmentClick={(inst) => {
        const item = schedule.find((s) => s.id === inst.id);
        if (item) {
          setEditScheduleItem(item);
          setEditDueDate(item.dueDate);
          setEditPlannedAmount(String(item.plannedAmount));
        }
      }}
    />
  );

  const paymentsTabContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Принятые платежи ({payments.length})
        </h3>
        {isActive ? (
          <AppButton
            label="Принять платёж"
            variant="primary"
            size="md"
            onClick={() => setPaymentDrawerOpen(true)}
          />
        ) : null}
      </div>

      {payments.length === 0 ? (
        <AppStatePanel
          tone="empty"
          title="Нет платежей"
          description="Платежи появятся здесь после их регистрации"
        />
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatMoney(payment.amount, payment.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {PAYMENT_METHOD_LABEL[payment.paymentMethod]}
                    {payment.notes ? ` · ${payment.notes}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <AppStatusBadge
                      label={
                        payment.status === "confirmed"
                          ? "Подтверждён"
                          : payment.status === "pending"
                            ? "Ожидание"
                            : "Отклонён"
                      }
                      tone={
                        payment.status === "confirmed"
                          ? "success"
                          : payment.status === "pending"
                            ? "warning"
                            : "danger"
                      }
                    />
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  {payment.status === "pending" ? (
                    <div className="flex gap-1">
                      <AppButton
                        label="Подтвердить"
                        variant="primary"
                        size="sm"
                        onClick={() => setConfirmPaymentId(payment.id)}
                      />
                      <AppButton
                        label="Отклонить"
                        variant="destructive"
                        size="sm"
                        onClick={() => setRejectPaymentId(payment.id)}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs: readonly DealTabSpec[] = [
    { id: "info", title: "Информация", content: infoTabContent },
    { id: "schedule", title: "График платежей", content: scheduleTabContent },
    { id: "payments", title: "Платежи", content: paymentsTabContent },
  ];

  return (
    <>
      <div className="space-y-6 p-6">
        <AppPageHeader
          title={deal.dealNumber}
          breadcrumbs={[
            { id: "dashboard", label: "Панель", href: routes.dashboard },
            { id: "deals", label: "Сделки", href: routes.deals },
            { id: "detail", label: deal.dealNumber },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {isDraft ? (
                <AppButton
                  label="Активировать"
                  variant="primary"
                  isLoading={activating}
                  onClick={() => activate(deal.id)}
                />
              ) : null}
              {isActive ? (
                <AppButton
                  label="Завершить"
                  variant="primary"
                  isLoading={completing}
                  onClick={() => complete(deal.id)}
                />
              ) : null}
              {!isCancelled && !isCompleted ? (
                <AppButton
                  label="Отменить"
                  variant="destructive"
                  isLoading={cancelling}
                  onClick={() => cancel(deal.id)}
                />
              ) : null}
            </div>
          }
        />

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <AppStatCard title="Общая сумма" value={formatMoney(deal.totalAmount, deal.currency)} />
          <AppStatCard
            title="Оплачено"
            value={formatMoney(paidAmount, deal.currency)}
            deltaTone="success"
          />
          <AppStatCard
            title="Остаток"
            value={formatMoney(deal.finalAmount - paidAmount, deal.currency)}
            deltaTone="warning"
          />
          <AppStatCard title="Статус" value={DEAL_STATUS_LABEL[deal.status]} />
        </div>

        {/* Tabs */}
        <AppTabs tabs={tabs} />
      </div>

      <ReceivePaymentDrawer
        open={paymentDrawerOpen}
        dealId={deal.id}
        currency={deal.currency}
        onClose={() => setPaymentDrawerOpen(false)}
      />

      {/* Edit schedule item dialog */}
      {editScheduleItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Редактировать платёж #{editScheduleItem.paymentNumber}
            </h3>
            <div className="space-y-4">
              <AppInput
                id="edit-due-date"
                label="Дата платежа"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
              <AppInput
                id="edit-planned-amount"
                label="Сумма"
                type="number"
                value={editPlannedAmount}
                onChange={(e) => setEditPlannedAmount(e.target.value)}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <AppButton
                label="Отмена"
                variant="outline"
                onClick={() => setEditScheduleItem(null)}
              />
              <AppButton
                label="Сохранить"
                variant="primary"
                isLoading={updateScheduleMutation.isPending}
                onClick={() => {
                  updateScheduleMutation.mutate(
                    {
                      itemId: editScheduleItem.id,
                      input: {
                        dueDate: editDueDate || undefined,
                        plannedAmount: editPlannedAmount ? Number(editPlannedAmount) : undefined,
                      },
                    },
                    { onSuccess: () => setEditScheduleItem(null) },
                  );
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirm payment dialog */}
      <ConfirmDialog
        open={confirmPaymentId !== null}
        title="Подтвердить платёж"
        message="Вы уверены, что хотите подтвердить этот платёж? Сумма будет зачтена в счёт сделки."
        confirmText="Подтвердить"
        cancelText="Отмена"
        onConfirm={() => {
          if (confirmPaymentId) {
            confirmPaymentMutation.mutate(confirmPaymentId, {
              onSuccess: () => setConfirmPaymentId(null),
            });
          }
        }}
        onClose={() => setConfirmPaymentId(null)}
      />

      {/* Reject payment dialog */}
      <ConfirmDialog
        open={rejectPaymentId !== null}
        title="Отклонить платёж"
        message="Вы уверены, что хотите отклонить этот платёж?"
        confirmText="Отклонить"
        cancelText="Отмена"
        destructive
        onConfirm={() => {
          if (rejectPaymentId) {
            rejectPaymentMutation.mutate(rejectPaymentId, {
              onSuccess: () => setRejectPaymentId(null),
            });
          }
        }}
        onClose={() => setRejectPaymentId(null)}
      />
    </>
  );
}
