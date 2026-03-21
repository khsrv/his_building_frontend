"use client";

import { useState } from "react";
import { AppDrawerForm, AppInput } from "@/shared/ui";
import { Box, Typography } from "@mui/material";
import { useReturnDepositMutation } from "@/modules/deposits/presentation/hooks/use-return-deposit-mutation";
import type { Deposit, ReturnDepositInput } from "@/modules/deposits/domain/deposit";

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

interface ReturnDepositDialogProps {
  open: boolean;
  deposit: Deposit;
  onClose: () => void;
}

export function ReturnDepositDialog({
  open,
  deposit,
  onClose,
}: ReturnDepositDialogProps) {
  const mutation = useReturnDepositMutation();
  const [notes, setNotes] = useState("");

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  const handleSave = () => {
    const mutationArgs: { id: string; input?: ReturnDepositInput } = { id: deposit.id };
    if (notes.trim()) {
      mutationArgs.input = { notes: notes.trim() };
    }
    mutation.mutate(
      mutationArgs,
      {
        onSuccess: () => {
          setNotes("");
          onClose();
        },
      },
    );
  };

  return (
    <AppDrawerForm
      open={open}
      title="Возврат залога"
      subtitle="Подтвердите возврат залога клиенту"
      saveLabel="Подтвердить возврат"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      saveDisabled={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
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
          <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
            {formatMoney(deposit.amount, deposit.currency)}
          </Typography>
        </Box>
        <AppInput
          label="Причина возврата"
          value={notes}
          onChangeValue={setNotes}
          placeholder="Клиент передумал"
        />
      </Box>
    </AppDrawerForm>
  );
}
