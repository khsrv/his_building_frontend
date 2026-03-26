"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  AppPageHeader,
  AppButton,
  AppInput,
  AppSelect,
  AppStatCard,
  AppStatusBadge,
  AppDrawerForm,
  AppActionMenu,
  type AppActionMenuGroup,
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
import { regenerateSchedule } from "@/modules/deals/infrastructure/repository";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useContractTemplatesQuery } from "@/modules/contracts/presentation/hooks/use-contract-templates-query";
import { useGenerateContractMutation } from "@/modules/contracts/presentation/hooks/use-generate-contract-mutation";

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
  barter: "Бартер",
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
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [generatedContractHtml, setGeneratedContractHtml] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelRefundType, setCancelRefundType] = useState<"full" | "partial" | "none">("full");
  const [cancelPenaltyAmount, setCancelPenaltyAmount] = useState("");
  const [cancelPenaltyReason, setCancelPenaltyReason] = useState("");
  const queryClient = useQueryClient();

  const { data: deal, isLoading: dealLoading, error: dealError } = useEnrichedDealDetailQuery(id);
  const { data: schedule = [], isLoading: scheduleLoading } = useDealScheduleQuery(id);
  const { data: payments = [] } = useDealPaymentsQuery(id);

  const { mutate: activate, isPending: activating } = useActivateDealMutation();
  const { mutate: complete, isPending: completing } = useCompleteDealMutation();
  const { mutate: cancel, isPending: cancelling } = useCancelDealMutation();
  const updateScheduleMutation = useUpdateScheduleItemMutation(id);
  const confirmPaymentMutation = useConfirmPaymentMutation(id);
  const rejectPaymentMutation = useRejectPaymentMutation(id);
  const contractTemplatesQuery = useContractTemplatesQuery();
  const generateContractMutation = useGenerateContractMutation();
  const defaultTemplateId = useMemo(() => {
    const templates = contractTemplatesQuery.data ?? [];
    return (templates.find((template) => template.isActive) ?? templates[0])?.id ?? "";
  }, [contractTemplatesQuery.data]);

  if (dealLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <ShimmerBox className="h-16 w-full rounded-xl" />
        <ShimmerBox className="h-40 w-full rounded-xl" />
        <ShimmerBox className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (dealError || !deal) {
    return (
      <div className="p-4 md:p-6">
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

  const paidAmount = deal.paidAmount > 0 ? deal.paidAmount : schedule.reduce((sum, item) => sum + item.paidAmount, 0);
  const hasBarterPayment = payments.some((p) => p.paymentMethod === "barter");

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
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
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

  async function handleRegenerateSchedule() {
    setRegenerating(true);
    try {
      await regenerateSchedule(id);
      void queryClient.invalidateQueries({ queryKey: dealKeys.schedule(id) });
      void queryClient.invalidateQueries({ queryKey: dealKeys.detail(id) });
    } catch {
      // error handled silently
    } finally {
      setRegenerating(false);
    }
  }

  const scheduleTabContent = scheduleLoading ? (
    <ShimmerBox className="h-64 w-full rounded-xl" />
  ) : schedule.length === 0 ? (
    <div className="space-y-4">
      <AppStatePanel
        tone="empty"
        title="График платежей не создан"
        description="График платежей будет сформирован после активации сделки"
      />
      {deal?.status === "active" ? (
        <div className="flex justify-center">
          <AppButton
            label="Сгенерировать график"
            variant="primary"
            isLoading={regenerating}
            onClick={() => void handleRegenerateSchedule()}
          />
        </div>
      ) : null}
    </div>
  ) : (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AppButton
          label="Пересоздать график"
          variant="outline"
          size="sm"
          isLoading={regenerating}
          onClick={() => void handleRegenerateSchedule()}
        />
      </div>
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
    </div>
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
                  {payment.barterDescription ? (
                    <p className="text-xs text-muted-foreground">
                      Получено взамен: {payment.barterDescription}
                    </p>
                  ) : null}
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
      <div className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title={deal.dealNumber}
          {...(hasBarterPayment ? { meta: <AppStatusBadge label="Обмен" tone="warning" /> } : {})}
          breadcrumbs={[
            { id: "dashboard", label: "Панель", href: routes.dashboard },
            { id: "deals", label: "Сделки", href: routes.deals },
            { id: "detail", label: deal.dealNumber },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {isActive ? (
                <AppButton
                  label="Принять платёж"
                  variant="primary"
                  onClick={() => setPaymentDrawerOpen(true)}
                />
              ) : null}
              {isDraft ? (
                <AppButton
                  label="Активировать"
                  variant="primary"
                  isLoading={activating}
                  onClick={() => activate(deal.id)}
                />
              ) : null}
              {(() => {
                const mainItems = [
                  ...(!isCancelled ? [{
                    id: "contract",
                    label: "Сформировать договор",
                    onClick: () => {
                      setContractError(null);
                      setGeneratedContractHtml(null);
                      setContractDialogOpen(true);
                    },
                  }] : []),
                  ...(isActive ? [{
                    id: "complete",
                    label: "Завершить сделку",
                    onClick: () => setCompleteConfirmOpen(true),
                  }] : []),
                ];
                const dangerItems = !isCancelled && !isCompleted ? [{
                  id: "cancel",
                  label: "Отменить сделку",
                  destructive: true as const,
                  onClick: () => {
                    setCancelReason("");
                    setCancelRefundType(paidAmount > 0 ? "full" : "none");
                    setCancelPenaltyAmount("");
                    setCancelPenaltyReason("");
                    setCancelDialogOpen(true);
                  },
                }] : [];
                const groups: AppActionMenuGroup[] = [
                  ...(mainItems.length > 0 ? [{ id: "main", items: mainItems }] : []),
                  ...(dangerItems.length > 0 ? [{ id: "danger", items: dangerItems }] : []),
                ];
                return groups.length > 0 ? (
                  <AppActionMenu triggerLabel="Действия" groups={groups} />
                ) : null;
              })()}
            </div>
          }
        />

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <AppStatCard title="Общая сумма" value={formatMoney(deal.finalAmount, deal.currency)} />
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

        {/* Cancellation info */}
        {isCancelled && deal.cancellation ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-800">
              Сделка отменена
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-red-700">Причина</span>
                <span className="font-medium text-red-900">{deal.cancellation.reason}</span>
              </div>
              {deal.cancellation.paidAmount > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-red-700">Было оплачено</span>
                    <span className="font-medium">{formatMoney(deal.cancellation.paidAmount, deal.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-700">Тип возврата</span>
                    <span className="font-medium">
                      {deal.cancellation.refundType === "full" ? "Полный возврат" : deal.cancellation.refundType === "partial" ? "Частичный (со штрафом)" : "Без возврата"}
                    </span>
                  </div>
                  {deal.cancellation.refundAmount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-red-700">К возврату</span>
                      <span className="font-bold text-red-900">{formatMoney(deal.cancellation.refundAmount, deal.currency)}</span>
                    </div>
                  ) : null}
                  {deal.cancellation.penaltyAmount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-red-700">Штраф</span>
                      <span className="font-medium">{formatMoney(deal.cancellation.penaltyAmount, deal.currency)}{deal.cancellation.penaltyReason ? ` — ${deal.cancellation.penaltyReason}` : ""}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-red-700">Статус возврата</span>
                    <AppStatusBadge
                      label={deal.cancellation.refundStatus === "refunded" ? "Возвращено" : deal.cancellation.refundStatus === "pending" ? "Ожидает возврата" : "Не требуется"}
                      tone={deal.cancellation.refundStatus === "refunded" ? "success" : deal.cancellation.refundStatus === "pending" ? "warning" : "muted"}
                    />
                  </div>
                </>
              ) : null}
              {deal.cancelledAt ? (
                <div className="flex items-center justify-between">
                  <span className="text-red-700">Дата отмены</span>
                  <span className="font-medium">{new Date(deal.cancelledAt).toLocaleDateString("ru-RU")}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <AppTabs tabs={tabs} />
      </div>

      <ReceivePaymentDrawer
        open={paymentDrawerOpen}
        dealId={deal.id}
        clientId={deal.clientId}
        currency={deal.currency}
        propertyId={deal.propertyId}
        onClose={() => setPaymentDrawerOpen(false)}
      />

      {/* Edit schedule item dialog */}
      {editScheduleItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 md:p-6 shadow-xl">
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
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
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

      {/* Complete deal confirm */}
      <ConfirmDialog
        open={completeConfirmOpen}
        title="Завершить сделку?"
        message={
          deal.finalAmount - paidAmount > 0
            ? `У клиента остаток долга: ${formatMoney(deal.finalAmount - paidAmount, deal.currency)}. Вы уверены, что хотите завершить сделку с непогашенным долгом?`
            : "Сделка полностью оплачена. Подтвердите завершение."
        }
        confirmText={completing ? "Завершение..." : "Завершить"}
        cancelText="Отмена"
        destructive={deal.finalAmount - paidAmount > 0}
        onConfirm={() => {
          complete(deal.id, {
            onSuccess: () => setCompleteConfirmOpen(false),
          });
        }}
        onClose={() => setCompleteConfirmOpen(false)}
      />

      {/* Cancel deal drawer */}
      <AppDrawerForm
        open={cancelDialogOpen}
        title="Отменить сделку"
        subtitle={paidAmount > 0 ? `Оплачено: ${formatMoney(paidAmount, deal.currency)}` : "Платежей нет"}
        saveLabel={cancelling ? "Отмена..." : "Отменить сделку"}
        cancelLabel="Назад"
        isSaving={cancelling}
        saveDisabled={paidAmount > 0 && !cancelReason.trim()}
        onClose={() => setCancelDialogOpen(false)}
        onSave={() => {
          cancel(
            {
              id: deal.id,
              input: {
                reason: cancelReason.trim(),
                refundType: paidAmount > 0 ? cancelRefundType : "none",
                penaltyAmount: cancelRefundType === "partial" ? parseFloat(cancelPenaltyAmount) || 0 : undefined,
                penaltyReason: cancelRefundType === "partial" ? cancelPenaltyReason.trim() || undefined : undefined,
                force: paidAmount > 0,
              },
            },
            { onSuccess: () => setCancelDialogOpen(false) },
          );
        }}
      >
        <div className="space-y-4">
          {paidAmount > 0 ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
              <p className="font-semibold text-red-800">
                По этой сделке уже оплачено {formatMoney(paidAmount, deal.currency)}
              </p>
              <p className="mt-1 text-red-700">
                Выберите как поступить с оплаченными средствами.
              </p>
            </div>
          ) : null}

          <AppInput
            label={paidAmount > 0 ? "Причина отмены *" : "Причина отмены"}
            value={cancelReason}
            onChangeValue={setCancelReason}
            placeholder="Клиент отказался от покупки..."
          />

          {paidAmount > 0 ? (
            <>
              <AppSelect
                id="refund-type"
                label="Возврат средств"
                value={cancelRefundType}
                onChange={(e) => setCancelRefundType(e.target.value as "full" | "partial" | "none")}
                options={[
                  { value: "full", label: `Полный возврат — ${formatMoney(paidAmount, deal.currency)}` },
                  { value: "partial", label: "Частичный возврат (со штрафом)" },
                  { value: "none", label: "Без возврата (удержание всей суммы)" },
                ]}
              />

              {cancelRefundType === "partial" ? (
                <>
                  <AppInput
                    label="Сумма штрафа"
                    type="number"
                    value={cancelPenaltyAmount}
                    onChangeValue={setCancelPenaltyAmount}
                    placeholder="5000"
                  />
                  {cancelPenaltyAmount ? (
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">К возврату: </span>
                      <span className="font-semibold">
                        {formatMoney(Math.max(0, paidAmount - (parseFloat(cancelPenaltyAmount) || 0)), deal.currency)}
                      </span>
                    </div>
                  ) : null}
                  <AppInput
                    label="Причина штрафа"
                    value={cancelPenaltyReason}
                    onChangeValue={setCancelPenaltyReason}
                    placeholder="Штраф за расторжение договора 10%"
                  />
                </>
              ) : null}

              {cancelRefundType === "none" ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Все оплаченные средства ({formatMoney(paidAmount, deal.currency)}) будут удержаны компанией.
                </div>
              ) : null}

              {cancelRefundType === "full" ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Клиенту будет возвращено {formatMoney(paidAmount, deal.currency)}. Возврат появится в списке ожидающих для бухгалтерии.
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </AppDrawerForm>

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

      {/* Generate contract dialog */}
      {contractDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-border bg-card p-4 md:p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Генерация договора</h3>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <AppSelect
                id="contract-template-select"
                label="Шаблон договора"
                value={selectedTemplateId || defaultTemplateId}
                options={[
                  { label: "Автовыбор шаблона", value: "" },
                  ...((contractTemplatesQuery.data ?? []).map((template) => ({
                    label: template.name,
                    value: template.id,
                  }))),
                ]}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
              />
              <div className="pt-6">
                <AppButton
                  label={generateContractMutation.isPending ? "Генерация..." : "Сгенерировать"}
                  variant="primary"
                  isLoading={generateContractMutation.isPending}
                  onClick={() => {
                    setContractError(null);
                    const templateId = selectedTemplateId || defaultTemplateId;
                    const contractInput = templateId
                      ? { dealId: deal.id, templateId }
                      : { dealId: deal.id };
                    generateContractMutation.mutate(
                      contractInput,
                      {
                        onSuccess: (result) => {
                          setGeneratedContractHtml(result.html);
                        },
                        onError: (error) => {
                          setContractError(
                            error instanceof Error
                              ? error.message
                              : "Не удалось сгенерировать договор",
                          );
                        },
                      },
                    );
                  }}
                />
              </div>
              <div className="pt-6">
                <AppButton
                  label="Закрыть"
                  variant="outline"
                  onClick={() => setContractDialogOpen(false)}
                />
              </div>
            </div>

            {contractError ? (
              <div className="mt-4">
                <AppStatePanel
                  tone="error"
                  title="Ошибка генерации договора"
                  description={contractError}
                />
              </div>
            ) : null}

            {generatedContractHtml ? (
              <div className="mt-4 space-y-2">
                <div className="flex justify-end">
                  <AppButton
                    label="Открыть в новом окне"
                    variant="outline"
                    onClick={() => {
                      const win = window.open("", "_blank");
                      if (!win) {
                        return;
                      }
                      win.document.open();
                      win.document.write(generatedContractHtml);
                      win.document.close();
                    }}
                  />
                </div>
                <iframe
                  title="Предпросмотр договора"
                  className="h-[60vh] w-full rounded-lg border border-border bg-white"
                  srcDoc={generatedContractHtml}
                />
              </div>
            ) : (
              <div className="mt-4">
                <AppStatePanel
                  tone="empty"
                  title="Предпросмотр договора"
                  description="Выберите шаблон и нажмите «Сгенерировать», чтобы увидеть готовый договор."
                />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
