"use client";

import { useState, useMemo } from "react";
import { Box, Typography, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { AppDrawerForm, AppSearchableSelect, AppButton } from "@/shared/ui";
import { useApplyDepositMutation } from "@/modules/deposits/presentation/hooks/use-apply-deposit-mutation";
import { useClientsListQuery } from "@/modules/clients/presentation/hooks/use-clients-list-query";
import { useDealsListQuery } from "@/modules/deals/presentation/hooks/use-deals-list-query";
import { useDealScheduleQuery } from "@/modules/deals/presentation/hooks/use-deal-schedule-query";
import type { Deposit } from "@/modules/deposits/domain/deposit";

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

interface ApplyDepositDialogProps {
  open: boolean;
  deposit: Deposit;
  onClose: () => void;
}

export function ApplyDepositDialog({
  open,
  deposit,
  onClose,
}: ApplyDepositDialogProps) {
  const mutation = useApplyDepositMutation();

  // Step 1: client + deal selection, Step 2: schedule item selection
  const [step, setStep] = useState<1 | 2>(1);
  const [clientId, setClientId] = useState(deposit.clientId ?? "");
  const [dealId, setDealId] = useState("");
  const [scheduleItemId, setScheduleItemId] = useState("");

  const clientLocked = Boolean(deposit.clientId);

  const { data: clientsResult } = useClientsListQuery({ limit: 200 });
  const clients = clientsResult?.items ?? [];

  const { data: dealsResult } = useDealsListQuery(
    clientId ? { clientId, status: "active", limit: 100 } : undefined,
    Boolean(clientId),
  );
  const deals = dealsResult ?? [];

  const { data: schedule = [] } = useDealScheduleQuery(dealId);

  const unpaidScheduleItems = useMemo(
    () => schedule.filter((item) => item.status !== "paid"),
    [schedule],
  );

  const clientOptions = clients.map((c) => ({
    id: c.id,
    label: c.fullName,
    secondary: c.phone,
  }));

  const dealOptions = deals.map((d) => ({
    id: d.id,
    label: `${d.dealNumber} — ${d.propertyName}, кв. ${d.unitNumber}`,
    secondary: `${formatMoney(d.totalAmount, d.currency)} · ${d.status}`,
  }));

  const selectedDeal = deals.find((d) => d.id === dealId);

  const reset = () => {
    setStep(1);
    setClientId(deposit.clientId ?? "");
    setDealId("");
    setScheduleItemId("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleApply = () => {
    if (!dealId || !clientId) return;
    mutation.mutate(
      {
        id: deposit.id,
        input: {
          dealId,
          clientId,
          scheduleItemId: scheduleItemId || undefined,
        },
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  // Step 2 content
  if (step === 2) {
    return (
      <AppDrawerForm
        open={open}
        title="Привязка к платежу по графику"
        subtitle={selectedDeal ? `Сделка: ${selectedDeal.dealNumber}` : ""}
        saveLabel="Зачесть"
        cancelLabel="Назад"
        isSaving={mutation.isPending}
        saveDisabled={mutation.isPending || !dealId}
        onClose={() => setStep(1)}
        onSave={handleApply}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {deposit.depositorName}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
              {formatMoney(deposit.amount, deposit.currency)}
            </Typography>
          </Box>

          <RadioGroup
            value={scheduleItemId}
            onChange={(e) => setScheduleItemId(e.target.value)}
          >
            <FormControlLabel
              value=""
              control={<Radio />}
              label="Без привязки к графику"
            />
            {unpaidScheduleItems.map((item) => (
              <FormControlLabel
                key={item.id}
                value={item.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2">
                      Платёж #{item.paymentNumber} — {item.dueDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      План: {formatMoney(item.plannedAmount, deposit.currency)} · Оплачено:{" "}
                      {formatMoney(item.paidAmount, deposit.currency)}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>

          {unpaidScheduleItems.length === 0 && schedule.length > 0 ? (
            <Typography variant="body2" color="text.secondary">
              Все платежи по графику оплачены
            </Typography>
          ) : null}
        </Box>
      </AppDrawerForm>
    );
  }

  // Step 1 content
  return (
    <AppDrawerForm
      open={open}
      title="Зачёт залога в сделку"
      subtitle="Выберите клиента и сделку для зачёта"
      saveLabel="Далее"
      cancelLabel="Отмена"
      saveDisabled={!dealId || !clientId}
      onClose={handleClose}
      onSave={() => setStep(2)}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {deposit.depositorName}
          </Typography>
          {deposit.depositorPhone ? (
            <Typography variant="body2" color="text.secondary">
              {deposit.depositorPhone}
            </Typography>
          ) : null}
          <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
            {formatMoney(deposit.amount, deposit.currency)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            Клиент {clientLocked ? "(из залога)" : "*"}
          </Typography>
          <AppSearchableSelect
            options={clientOptions}
            value={clientId || null}
            onChange={(id) => {
              setClientId(id);
              setDealId("");
            }}
            triggerLabel={
              clientId
                ? clients.find((c) => c.id === clientId)?.fullName ?? "Выбрать клиента"
                : "Выбрать клиента"
            }
            dialogTitle="Выбор клиента"
            searchPlaceholder="Поиск по имени..."
            emptyLabel="Клиенты не найдены"
            disabled={clientLocked}
          />
        </Box>

        {clientId ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Сделка *
            </Typography>
            {deals.length > 0 ? (
              <AppSearchableSelect
                options={dealOptions}
                value={dealId || null}
                onChange={(id) => setDealId(id)}
                triggerLabel={
                  dealId
                    ? deals.find((d) => d.id === dealId)?.dealNumber ?? "Выбрать сделку"
                    : "Выбрать сделку"
                }
                dialogTitle="Выбор сделки"
                searchPlaceholder="Поиск по номеру..."
                emptyLabel="Нет активных сделок"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                У клиента нет активных сделок
              </Typography>
            )}
          </Box>
        ) : null}

        {selectedDeal ? (
          <Box sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary">
              Объект: {selectedDeal.propertyName}, кв. {selectedDeal.unitNumber}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatMoney(selectedDeal.totalAmount, selectedDeal.currency)}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </AppDrawerForm>
  );
}
