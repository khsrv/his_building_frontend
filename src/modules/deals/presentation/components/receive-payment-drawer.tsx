"use client";

import { useState } from "react";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useReceivePaymentMutation } from "@/modules/deals/presentation/hooks/use-receive-payment-mutation";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "cash", label: "Наличные" },
  { value: "bank_transfer", label: "Банковский перевод" },
  { value: "mobile", label: "Мобильный платёж" },
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
  const { mutateAsync: receivePayment, isPending } = useReceivePaymentMutation(dealId);
  const { data: accounts } = useAccountsQuery();

  const accountOptions: { value: string; label: string }[] = (accounts ?? []).map((acc) => ({
    value: acc.id,
    label: `${acc.name} (${acc.currency})`,
  }));

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "mobile">("cash");
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleClose = () => {
    setAmount("");
    setSelectedCurrency(currency);
    setPaymentMethod("cash");
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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const input: Parameters<typeof receivePayment>[0] = {
      dealId,
      clientId,
      amount: parseFloat(amount),
      currency: selectedCurrency,
      paymentMethod,
      accountId,
    };
    if (scheduleItemId) input.scheduleItemId = scheduleItemId;
    if (notes) input.notes = notes;
    await receivePayment(input);
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
          onChange={(e) =>
            setPaymentMethod(e.target.value as "cash" | "bank_transfer" | "mobile")
          }
          {...(errors.paymentMethod ? { errorText: errors.paymentMethod } : {})}
        />

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
