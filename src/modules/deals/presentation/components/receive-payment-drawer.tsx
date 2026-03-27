"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useReceivePaymentMutation } from "@/modules/deals/presentation/hooks/use-receive-payment-mutation";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { useSettingsQuery } from "@/modules/settings/presentation/hooks/use-settings-query";
import { confirmPayment } from "@/modules/deals/infrastructure/repository";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import { useI18n } from "@/shared/providers/locale-provider";

// ─── Constants ────────────────────────────────────────────────────────────────

type PaymentMethod = "cash" | "bank_transfer" | "mobile" | "barter";

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
  propertyId?: string;
  scheduleItemId?: string;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReceivePaymentDrawer({
  open,
  dealId,
  clientId,
  currency,
  propertyId,
  scheduleItemId,
  onClose,
}: ReceivePaymentDrawerProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { mutateAsync: receivePaymentMut, isPending } = useReceivePaymentMutation(dealId);
  // Generate a stable idempotency key per drawer open to prevent duplicate payment submissions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [open]);
  // When propertyId is provided, fetch only accounts for that property (API returns property-specific + global)
  const { data: accounts } = useAccountsQuery(propertyId);
  const { data: settings } = useSettingsQuery();
  const currencyOptions = useCurrencyOptions();
  const autoConfirm = settings?.["auto_confirm_payments"] !== "false";

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [barterDescription, setBarterDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isBarter = paymentMethod === "barter";
  const paymentMethodOptions: readonly { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: t("deals.receivePayment.method.cash") },
    { value: "bank_transfer", label: t("deals.receivePayment.method.bankTransfer") },
    { value: "mobile", label: t("deals.receivePayment.method.mobile") },
    { value: "barter", label: t("deals.receivePayment.method.barter") },
  ];

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
      nextErrors.amount = t("deals.receivePayment.errors.amount");
    }
    if (!paymentMethod) {
      nextErrors.paymentMethod = t("deals.receivePayment.errors.paymentMethod");
    }
    if (!accountId) {
      nextErrors.accountId = t("deals.receivePayment.errors.account");
    }
    if (isBarter && !barterDescription.trim()) {
      nextErrors.barterDescription = t("deals.receivePayment.errors.barter");
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
      idempotencyKey,
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
      title={t("deals.receivePayment.title")}
      subtitle={t("deals.receivePayment.subtitle")}
      onClose={handleClose}
      onSave={() => { void handleSave(); }}
      saveLabel={t("deals.receivePayment.save")}
      cancelLabel={t("common.cancel")}
      isSaving={isPending}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AppInput
            label={t("deals.receivePayment.fields.amount")}
            type="number"
            value={amount}
            onChangeValue={setAmount}
            {...(errors.amount ? { errorText: errors.amount } : {})}
          />
          <AppSelect
            id="recv-currency"
            label={t("deals.receivePayment.fields.currency")}
            options={currencyOptions}
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
          />
        </div>

        <AppSelect
          id="recv-method"
          label={t("deals.receivePayment.fields.method")}
          options={paymentMethodOptions}
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod(e.target.value as PaymentMethod);
            setBarterDescription("");
            setErrors((prev) => {
              const { barterDescription, ...rest } = prev;
              void barterDescription;
              return rest;
            });
          }}
          {...(errors.paymentMethod ? { errorText: errors.paymentMethod } : {})}
        />

        {isBarter && (
          <AppInput
            label={t("deals.receivePayment.fields.barter")}
            value={barterDescription}
            onChangeValue={setBarterDescription}
            placeholder={t("deals.receivePayment.placeholders.barter")}
            {...(errors.barterDescription ? { errorText: errors.barterDescription } : {})}
          />
        )}

        <AppSelect
          id="recv-account"
          label={t("deals.receivePayment.fields.account")}
          options={accountOptions}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          {...(errors.accountId ? { errorText: errors.accountId } : {})}
        />

        <AppInput
          label={t("deals.receivePayment.fields.notes")}
          value={notes}
          onChangeValue={setNotes}
        />
      </div>
    </AppDrawerForm>
  );
}
