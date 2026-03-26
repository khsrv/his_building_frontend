"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDrawerForm,
  AppInput,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppStatusBadge,
  type AppStatusTone,
  AppStatePanel,
  ShimmerBox,
} from "@/shared/ui";
import { IconCategory, IconOverdue, IconDebt } from "@/shared/ui/icons/kpi-icons";
import { routes } from "@/shared/constants/routes";
import { useCancellationsQuery } from "@/modules/deals/presentation/hooks/use-cancellations-query";
import { useMarkRefundedMutation } from "@/modules/deals/presentation/hooks/use-mark-refunded-mutation";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { useNotifier } from "@/shared/providers/notifier-provider";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";
import type { DealCancellationRecord } from "@/modules/deals/domain/refund";
import { usePropertyContext } from "@/shared/providers/property-provider";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMoney(v: number, currency = "USD"): string {
  if (!v) return "—";
  const sym = currency === "USD" ? "$" : currency;
  return `${sym}${v.toLocaleString("ru-RU")}`;
}

const REFUND_TYPE_LABEL: Record<string, string> = {
  full: "Полный возврат",
  partial: "Частичный (со штрафом)",
  none: "Без возврата",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Ожидает возврата",
  refunded: "Возвращено",
  not_required: "Не требуется",
};

const STATUS_TONE: Record<string, AppStatusTone> = {
  pending: "warning",
  refunded: "success",
  not_required: "muted",
};

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Наличные" },
  { value: "bank_transfer", label: "Банковский перевод" },
  { value: "mobile", label: "Мобильный платёж" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RefundsPage() {
  const router = useRouter();
  const notifier = useNotifier();
  const { currentPropertyId } = usePropertyContext();
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  const { data: cancellations, isLoading, isError } = useCancellationsQuery({
    status: filterStatus || undefined,
    propertyId: currentPropertyId || undefined,
  });
  const markRefundedMutation = useMarkRefundedMutation();
  const { data: accounts } = useAccountsQuery(currentPropertyId || undefined);

  // Refund drawer
  const [refundTarget, setRefundTarget] = useState<DealCancellationRecord | null>(null);
  const [refundAccountId, setRefundAccountId] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");
  const [refundNotes, setRefundNotes] = useState("");

  const items = cancellations ?? [];
  const pendingCount = items.filter((c) => c.refundStatus === "pending").length;
  const pendingTotal = items
    .filter((c) => c.refundStatus === "pending")
    .reduce((sum, c) => sum + c.refundAmount, 0);

  const accountOptions = (accounts ?? []).map((a) => ({
    value: a.id,
    label: `${a.name} (${a.currency})`,
  }));

  function handleOpenRefund(record: DealCancellationRecord) {
    setRefundTarget(record);
    setRefundAccountId("");
    setRefundMethod("cash");
    setRefundNotes("");
  }

  async function handleMarkRefunded() {
    if (!refundTarget || !refundAccountId) return;
    try {
      await markRefundedMutation.mutateAsync({
        cancellationId: refundTarget.id,
        input: {
          accountId: refundAccountId,
          paymentMethod: refundMethod as "cash" | "bank_transfer" | "mobile",
          notes: refundNotes.trim() || undefined,
        },
      });
      notifier.success("Возврат оформлен");
      setRefundTarget(null);
    } catch (err) {
      notifier.error(normalizeErrorMessage(err));
    }
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Возвраты"
            subtitle="Управление возвратами по отменённым сделкам"
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "refunds", label: "Возвраты" },
            ]}
          />
        }
        filters={
          <AppKpiGrid
            columns={3}
            items={[
              { title: "Всего записей", value: items.length, icon: <IconCategory /> },
              { title: "Ожидают возврата", value: pendingCount, deltaTone: "warning", icon: <IconOverdue /> },
              { title: "Сумма к возврату", value: fmtMoney(pendingTotal), deltaTone: "danger", icon: <IconDebt /> },
            ]}
          />
        }
        content={
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="w-48">
                <AppSelect
                  label="Статус"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[
                    { label: "Ожидают возврата", value: "pending" },
                    { label: "Возвращено", value: "refunded" },
                    { label: "Все", value: "" },
                  ]}
                />
              </div>
            </div>

            {isLoading ? (
              <ShimmerBox className="h-64 w-full rounded-xl" />
            ) : isError ? (
              <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить список возвратов" />
            ) : items.length === 0 ? (
              <AppStatePanel
                tone="empty"
                title={filterStatus === "pending" ? "Нет ожидающих возвратов" : "Нет записей"}
                description="Возвраты появятся при отмене сделок с оплатами"
              />
            ) : (
              <div className="space-y-3">
                {items.map((record) => (
                  <div
                    key={record.id}
                    className={`rounded-xl border p-4 ${
                      record.refundStatus === "pending"
                        ? "border-amber-200 bg-amber-50"
                        : record.refundStatus === "refunded"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-border bg-card"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold cursor-pointer hover:underline"
                            onClick={() => router.push(routes.dealDetail(record.dealId))}
                          >
                            {record.dealNumber || record.dealId.slice(0, 8)}
                          </span>
                          <AppStatusBadge
                            label={STATUS_LABEL[record.refundStatus] ?? record.refundStatus}
                            tone={STATUS_TONE[record.refundStatus] ?? "muted"}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {record.clientName}{record.clientPhone ? ` · ${record.clientPhone}` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Причина: {record.reason}
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <p className="text-lg font-bold">
                          {fmtMoney(record.refundAmount, record.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {REFUND_TYPE_LABEL[record.refundType] ?? record.refundType}
                        </p>
                        {record.penaltyAmount > 0 ? (
                          <p className="text-xs text-red-600">
                            Штраф: {fmtMoney(record.penaltyAmount, record.currency)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString("ru-RU")}
                        {record.refundedAt ? ` · Возвращено: ${new Date(record.refundedAt).toLocaleDateString("ru-RU")}` : ""}
                      </span>
                      {record.refundStatus === "pending" && record.refundAmount > 0 ? (
                        <AppButton
                          label="Оформить возврат"
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenRefund(record)}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* Mark refunded drawer */}
      <AppDrawerForm
        open={refundTarget !== null}
        title="Оформить возврат"
        subtitle={refundTarget ? `${refundTarget.dealNumber} · ${refundTarget.clientName}` : ""}
        saveLabel={markRefundedMutation.isPending ? "Оформление..." : "Оформить возврат"}
        cancelLabel="Отмена"
        isSaving={markRefundedMutation.isPending}
        saveDisabled={!refundAccountId}
        onClose={() => setRefundTarget(null)}
        onSave={() => void handleMarkRefunded()}
      >
        {refundTarget ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Сумма к возврату</span>
                <span className="font-bold text-lg">{fmtMoney(refundTarget.refundAmount, refundTarget.currency)}</span>
              </div>
              {refundTarget.penaltyAmount > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Удержано (штраф)</span>
                  <span className="font-medium text-red-600">{fmtMoney(refundTarget.penaltyAmount, refundTarget.currency)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Было оплачено</span>
                <span>{fmtMoney(refundTarget.paidAmount, refundTarget.currency)}</span>
              </div>
            </div>

            <AppSelect
              id="refund-account"
              label="Счёт списания *"
              value={refundAccountId}
              onChange={(e) => setRefundAccountId(e.target.value)}
              options={[{ value: "", label: "Выберите счёт" }, ...accountOptions]}
            />

            <AppSelect
              id="refund-method"
              label="Способ возврата"
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              options={PAYMENT_METHOD_OPTIONS}
            />

            <AppInput
              label="Примечание"
              value={refundNotes}
              onChangeValue={setRefundNotes}
              placeholder="Возврат наличными в офисе"
            />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              После оформления будет создана расходная транзакция на сумму {fmtMoney(refundTarget.refundAmount, refundTarget.currency)} и списана со выбранного счёта.
            </div>
          </div>
        ) : null}
      </AppDrawerForm>
    </main>
  );
}
