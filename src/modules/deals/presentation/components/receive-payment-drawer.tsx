"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useReceivePaymentMutation } from "@/modules/deals/presentation/hooks/use-receive-payment-mutation";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { useSettingsQuery } from "@/modules/settings/presentation/hooks/use-settings-query";
import { confirmPayment } from "@/modules/deals/infrastructure/repository";
import { dealKeys } from "@/modules/deals/presentation/query-keys";

// ─── Constants ────────────────────────────────────────────────────────────────

type PaymentMethod = "cash" | "bank_transfer" | "mobile" | "barter";

const PAYMENT_METHOD_OPTIONS: readonly { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Наличные" },
  { value: "bank_transfer", label: "Банковский перевод" },
  { value: "mobile", label: "Мобильный платёж" },
  { value: "barter", label: "Бартер" },
];

const CURRENCY_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "TJS", label: "TJS" },
  { value: "RUB", label: "RUB" },
  { value: "EUR", label: "EUR" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  amount?: string;
  paymentMethod?: string;
  accountId?: string;
  barterDescription?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReceivePaymentDrawerProps {
  open: boolean;
  dealId: string;
  clientId: string;
  currency: string;
  scheduleItemId?: string;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReceivePaymentDrawer({
  open,
  dealId,
  clientId,
  currency,
  scheduleItemId,
  onClose,
}: ReceivePaymentDrawerProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: receivePaymentMut, isPending } = useReceivePaymentMutation(dealId);
  const { data: accounts } = useAccountsQuery();
  const { data: settings } = useSettingsQuery();
  const autoConfirm = settings?.["auto_confirm_payments"] !== "false";

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [barterDescription, setBarterDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isBarter = paymentMethod === "barter";

  // For barter: put accounts with "бартер" or "обмен" in name first
  const sortedAccounts = [...(accounts ?? [])].sort((a, b) => {
    if (!isBarter) return 0;
    const isExchangeAccount = (name: string) => {
      const lower = name.toLowerCase();
      return lower.includes("бартер") || lower.includes("обмен");
    };
    const aFirst = isExchangeAccount(a.name);
    const bFirst = isExchangeAccount(b.name);
    if (aFirst && !bFirst) return -1;
    if (!aFirst && bFirst) return 1;
    return 0;
  });

  const accountOptions = sortedAccounts.map((acc) => ({
    value: acc.id,
    label: `${acc.name} (${acc.currency})`,
  }));

  const handleClose = () => {
    setAmount("");
    setSelectedCurrency(currency);
    setPaymentMethod("cash");
    setBarterDescription("");
    setAccountId("");
    setNotes("");
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      nextErrors.amount = "Введите сумму больше 0";
    }
    if (!paymentMethod) {
      nextErrors.paymentMethod = "Выберите способ оплаты";
    }
    if (!accountId) {
      nextErrors.accountId = "Выберите счёт";
    }
    if (isBarter && !barterDescription.trim()) {
      nextErrors.barterDescription = "Укажите что получили в счёт оплаты";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const input: Parameters<typeof receivePaymentMut>[0] = {
      dealId,
      clientId,
      amount: parseFloat(amount),
      currency: selectedCurrency,
      paymentMethod,
      accountId,
    };
    if (scheduleItemId) input.scheduleItemId = scheduleItemId;
    if (notes) input.notes = notes;
    if (isBarter && barterDescription.trim()) {
      input.barterDescription = barterDescription.trim();
    }
    const payment = await receivePaymentMut(input);
    // Auto-confirm if setting enabled (default: true)
    if (autoConfirm && payment.status === "pending") {
      try {
        await confirmPayment(payment.id);
        // Re-invalidate cache after confirm so UI shows "confirmed"
        void queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
        void queryClient.invalidateQueries({ queryKey: dealKeys.schedule(dealId) });
        void queryClient.invalidateQueries({ queryKey: dealKeys.payments(dealId) });
        void queryClient.invalidateQueries({ queryKey: ["payments"] });
      } catch {
        // Confirm failed silently — user can confirm manually
      }
    }
    handleClose();
  };

  return (
    <AppDrawerForm
      open={open}
      title="Принять платёж"
      subtitle="Введите данные об оплате"
      onClose={handleClose}
      onSave={() => { void handleSave(); }}
      saveLabel="Принять платёж"
      cancelLabel="Отмена"
      isSaving={isPending}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AppInput
            label="Сумма"
            type="number"
            value={amount}
            onChangeValue={setAmount}
            {...(errors.amount ? { errorText: errors.amount } : {})}
          />
          <AppSelect
            id="recv-currency"
            label="Валюта"
            options={CURRENCY_OPTIONS}
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
          />
        </div>

        <AppSelect
          id="recv-method"
          label="Способ оплаты"
          options={PAYMENT_METHOD_OPTIONS}
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod(e.target.value as PaymentMethod);
            setBarterDescription("");
            setErrors((prev) => {
              const { barterDescription: _removed, ...rest } = prev;
              return rest;
            });
          }}
          {...(errors.paymentMethod ? { errorText: errors.paymentMethod } : {})}
        />

        {isBarter && (
          <AppInput
            label="Что получаем взамен *"
            value={barterDescription}
            onChangeValue={setBarterDescription}
            placeholder="Квартира №9, ул. Навои 12, 2-комн, 45м²"
            {...(errors.barterDescription ? { errorText: errors.barterDescription } : {})}
          />
        )}

        <AppSelect
          id="recv-account"
          label="Счёт"
          options={accountOptions}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          {...(errors.accountId ? { errorText: errors.accountId } : {})}
        />

        <AppInput
          label="Примечание"
          value={notes}
          onChangeValue={setNotes}
        />
      </div>
    </AppDrawerForm>
  );
}
