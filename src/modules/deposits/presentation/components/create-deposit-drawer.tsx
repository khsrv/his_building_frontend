"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect, AppSearchableSelect } from "@/shared/ui";
import { useCreateDepositMutation } from "@/modules/deposits/presentation/hooks/use-create-deposit-mutation";
import { useClientsListQuery } from "@/modules/clients/presentation/hooks/use-clients-list-query";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";

const CURRENCY_OPTIONS = [
  { value: "UZS", label: "UZS" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
] as const;

interface FormState {
  depositorName: string;
  depositorPhone: string;
  clientId: string;
  amount: string;
  currency: string;
  accountId: string;
  propertyId: string;
  notes: string;
}

type FormErrors = Partial<Record<"depositorName" | "amount", string>>;

interface CreateDepositDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDepositDrawer({ open, onClose }: CreateDepositDrawerProps) {
  const mutation = useCreateDepositMutation();
  const { data: clientsResult } = useClientsListQuery({ limit: 200 });
  const clients = clientsResult?.items ?? [];
  const { data: accounts = [] } = useAccountsQuery();
  const { data: propertiesResult } = usePropertiesListQuery();
  const properties = propertiesResult?.items ?? [];

  const [form, setForm] = useState<FormState>({
    depositorName: "",
    depositorPhone: "",
    clientId: "",
    amount: "",
    currency: "UZS",
    accountId: "",
    propertyId: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const clientOptions = clients.map((c) => ({
    id: c.id,
    label: c.fullName,
    secondary: c.phone,
  }));

  const accountOptions = [
    { value: "", label: "Без счёта" },
    ...accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` })),
  ];

  const propertyOptions = [
    { value: "", label: "Без объекта" },
    ...properties.map((p) => ({ value: p.id, label: p.name })),
  ];

  // Auto-fill depositor info when client is selected
  useEffect(() => {
    if (!form.clientId) return;
    const client = clients.find((c) => c.id === form.clientId);
    if (client) {
      setForm((prev) => ({
        ...prev,
        depositorName: prev.depositorName || client.fullName,
        depositorPhone: prev.depositorPhone || client.phone,
      }));
    }
  }, [form.clientId, clients]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm({
      depositorName: "",
      depositorPhone: "",
      clientId: "",
      amount: "",
      currency: "UZS",
      accountId: "",
      propertyId: "",
      notes: "",
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.depositorName.trim()) {
      next.depositorName = "Укажите имя вносителя";
    }
    const amountNum = parseFloat(form.amount);
    if (!form.amount || isNaN(amountNum) || amountNum <= 0) {
      next.amount = "Введите корректную сумму";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!validate()) return;
    mutation.mutate(
      {
        depositorName: form.depositorName.trim(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        depositorPhone: form.depositorPhone.trim() || undefined,
        clientId: form.clientId || undefined,
        accountId: form.accountId || undefined,
        propertyId: form.propertyId || undefined,
        notes: form.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <AppDrawerForm
      open={open}
      title="Принять залог"
      subtitle="Заполните данные залога"
      saveLabel="Принять залог"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      saveDisabled={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AppInput
          label="Имя вносителя *"
          value={form.depositorName}
          onChangeValue={set("depositorName")}
          placeholder="Иванов Иван Иванович"
          {...(errors.depositorName ? { errorText: errors.depositorName } : {})}
        />
        <AppInput
          label="Телефон"
          value={form.depositorPhone}
          onChangeValue={set("depositorPhone")}
          placeholder="+998901234567"
        />
        <AppSearchableSelect
          options={clientOptions}
          value={form.clientId || null}
          onChange={(id) => set("clientId")(id)}
          triggerLabel={
            form.clientId
              ? clients.find((c) => c.id === form.clientId)?.fullName ?? "Выбрать клиента"
              : "Выбрать клиента"
          }
          dialogTitle="Выбор клиента из CRM"
          searchPlaceholder="Поиск по имени или телефону..."
          emptyLabel="Клиенты не найдены"
        />
        <div className="grid grid-cols-2 gap-3">
          <AppInput
            label="Сумма *"
            type="number"
            value={form.amount}
            onChangeValue={set("amount")}
            placeholder="0"
            {...(errors.amount ? { errorText: errors.amount } : {})}
          />
          <AppSelect
            id="deposit-currency"
            label="Валюта *"
            options={CURRENCY_OPTIONS}
            value={form.currency}
            onChange={(e) => set("currency")(e.target.value)}
          />
        </div>
        <AppSelect
          id="deposit-account"
          label="Счёт / Касса"
          options={accountOptions}
          value={form.accountId}
          onChange={(e) => set("accountId")(e.target.value)}
        />
        <AppSelect
          id="deposit-property"
          label="Объект"
          options={propertyOptions}
          value={form.propertyId}
          onChange={(e) => set("propertyId")(e.target.value)}
        />
        <AppInput
          label="Заметки"
          value={form.notes}
          onChangeValue={set("notes")}
          placeholder="Залог за квартиру №15"
        />
      </Box>
    </AppDrawerForm>
  );
}
