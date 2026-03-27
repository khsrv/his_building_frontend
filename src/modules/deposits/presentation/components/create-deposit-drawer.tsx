"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect, AppSearchableSelect } from "@/shared/ui";
import { useCreateDepositMutation } from "@/modules/deposits/presentation/hooks/use-create-deposit-mutation";
import { useClientsListQuery } from "@/modules/clients/presentation/hooks/use-clients-list-query";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import { usePropertyContext } from "@/shared/providers/property-provider";
import { useI18n } from "@/shared/providers/locale-provider";

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

type FormErrors = Partial<Record<"depositorName" | "amount" | "propertyId", string>>;

interface CreateDepositDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDepositDrawer({ open, onClose }: CreateDepositDrawerProps) {
  const { t } = useI18n();
  const mutation = useCreateDepositMutation();
  const currencyOptions = useCurrencyOptions();
  const { currentPropertyId, hasProperty } = usePropertyContext();
  const { data: clientsResult } = useClientsListQuery({ limit: 200 });
  const clients = clientsResult?.items ?? [];
  const { data: accounts = [] } = useAccountsQuery(currentPropertyId || undefined);
  const { data: propertiesResult } = usePropertiesListQuery();
  const properties = propertiesResult?.items ?? [];

  const [form, setForm] = useState<FormState>({
    depositorName: "",
    depositorPhone: "",
    clientId: "",
    amount: "",
    currency: "UZS",
    accountId: "",
    propertyId: currentPropertyId,
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const clientOptions = clients.map((c) => ({
    id: c.id,
    label: c.fullName,
    secondary: c.phone,
  }));

  const accountOptions = [
    { value: "", label: t("deposits.create.account.none") },
    ...accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` })),
  ];

  const propertyOptions = properties.map((p) => ({ value: p.id, label: p.name }));

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
      propertyId: currentPropertyId,
      notes: "",
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.depositorName.trim()) {
      next.depositorName = t("deposits.create.validation.depositorName");
    }
    const amountNum = parseFloat(form.amount);
    if (!form.amount || isNaN(amountNum) || amountNum <= 0) {
      next.amount = t("deposits.create.validation.amount");
    }
    if (!form.propertyId) {
      next.propertyId = t("deposits.create.validation.property");
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
        propertyId: form.propertyId,
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
      title={t("deposits.create.title")}
      subtitle={t("deposits.create.subtitle")}
      saveLabel={t("deposits.create.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      saveDisabled={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AppInput
          label={t("deposits.create.fields.depositorNameRequired")}
          value={form.depositorName}
          onChangeValue={set("depositorName")}
          placeholder={t("deposits.create.placeholders.depositorName")}
          {...(errors.depositorName ? { errorText: errors.depositorName } : {})}
        />
        <AppInput
          label={t("deposits.create.fields.phone")}
          value={form.depositorPhone}
          onChangeValue={set("depositorPhone")}
          placeholder="+998901234567"
        />
        <AppSearchableSelect
          options={clientOptions}
          value={form.clientId || null}
          onChange={(id) => {
            const selectedClient = clients.find((c) => c.id === id);
            setForm((prev) => ({
              ...prev,
              clientId: id,
              depositorName: prev.depositorName || selectedClient?.fullName || "",
              depositorPhone: prev.depositorPhone || selectedClient?.phone || "",
            }));
          }}
          triggerLabel={
            form.clientId
              ? clients.find((c) => c.id === form.clientId)?.fullName ?? t("deposits.create.client.select")
              : t("deposits.create.client.select")
          }
          dialogTitle={t("deposits.create.client.dialogTitle")}
          searchPlaceholder={t("deposits.create.client.searchPlaceholder")}
          emptyLabel={t("deposits.create.client.empty")}
        />
        <div className="grid grid-cols-2 gap-3">
          <AppInput
            label={t("deposits.create.fields.amountRequired")}
            type="number"
            value={form.amount}
            onChangeValue={set("amount")}
            placeholder="0"
            {...(errors.amount ? { errorText: errors.amount } : {})}
          />
          <AppSelect
            id="deposit-currency"
            label={t("deposits.create.fields.currencyRequired")}
            options={currencyOptions}
            value={form.currency}
            onChange={(e) => set("currency")(e.target.value)}
          />
        </div>
        <AppSelect
          id="deposit-account"
          label={t("deposits.create.fields.account")}
          options={accountOptions}
          value={form.accountId}
          onChange={(e) => set("accountId")(e.target.value)}
        />
        {hasProperty ? (
          <AppInput
            label={t("deposits.create.fields.propertyRequired")}
            value={properties.find((p) => p.id === form.propertyId)?.name ?? ""}
            disabled
          />
        ) : (
          <AppSelect
            id="deposit-property"
            label={t("deposits.create.fields.propertyRequired")}
            options={propertyOptions}
            value={form.propertyId}
            onChange={(e) => set("propertyId")(e.target.value)}
            {...(errors.propertyId ? { errorText: errors.propertyId } : {})}
          />
        )}
        <AppInput
          label={t("deposits.create.fields.notes")}
          value={form.notes}
          onChangeValue={set("notes")}
          placeholder={t("deposits.create.placeholders.notes")}
        />
      </Box>
    </AppDrawerForm>
  );
}
