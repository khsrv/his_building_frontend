"use client";

import { useState } from "react";
import { AppDrawerForm, AppInput } from "@/shared/ui";
import { Box, Typography } from "@mui/material";
import { useReturnDepositMutation } from "@/modules/deposits/presentation/hooks/use-return-deposit-mutation";
import type { Deposit, ReturnDepositInput } from "@/modules/deposits/domain/deposit";
import { useI18n } from "@/shared/providers/locale-provider";

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
  const { locale, t } = useI18n();
  const mutation = useReturnDepositMutation();
  const [notes, setNotes] = useState("");
  const localeCode = locale === "en" ? "en-US" : "ru-RU";

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
      title={t("deposits.return.title")}
      subtitle={t("deposits.return.subtitle")}
      saveLabel={t("deposits.return.save")}
      cancelLabel={t("common.cancel")}
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
            {`${deposit.amount.toLocaleString(localeCode)} ${deposit.currency}`}
          </Typography>
        </Box>
        <AppInput
          label={t("deposits.return.fields.reason")}
          value={notes}
          onChangeValue={setNotes}
          placeholder={t("deposits.return.placeholders.reason")}
        />
      </Box>
    </AppDrawerForm>
  );
}
