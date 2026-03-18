"use client";

import { useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  AppButton,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppStatePanel,
} from "@/shared/ui";
import { useSupplierBalanceQuery } from "@/modules/warehouse/presentation/hooks/use-supplier-balance-query";
import { useSupplierPaymentsQuery } from "@/modules/warehouse/presentation/hooks/use-supplier-payments-query";
import { SupplierPaymentDrawer } from "@/modules/warehouse/presentation/components/supplier-payment-drawer";
import type { SupplierPayment } from "@/modules/warehouse/domain/warehouse";

const PAYMENT_COLUMNS: readonly AppDataTableColumn<SupplierPayment>[] = [
  {
    id: "paidAt",
    header: "Дата",
    cell: (row) => new Date(row.paidAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.paidAt,
  },
  {
    id: "amount",
    header: "Сумма",
    cell: (row) => `${row.amount.toLocaleString("ru-RU")} ${row.currency}`,
    sortAccessor: (row) => row.amount,
    align: "right",
  },
  {
    id: "createdByName",
    header: "Кто создал",
    cell: (row) => row.createdByName,
  },
  {
    id: "notes",
    header: "Заметки",
    cell: (row) => row.notes ?? "—",
  },
];

interface SupplierDetailDialogProps {
  open: boolean;
  supplierId: string;
  supplierName: string;
  onClose: () => void;
}

export function SupplierDetailDialog({
  open,
  supplierId,
  supplierName,
  onClose,
}: SupplierDetailDialogProps) {
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);

  const balanceQuery = useSupplierBalanceQuery(supplierId);
  const paymentsQuery = useSupplierPaymentsQuery(supplierId);

  const balance = balanceQuery.data;
  const payments = paymentsQuery.data ?? [];

  return (
    <>
      <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
        <DialogTitle>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
          >
            <Typography variant="h6">{supplierName}</Typography>
            <IconButton aria-label="Закрыть" onClick={onClose} size="small">
              <svg
                aria-hidden
                fill="none"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Stack spacing={3}>
            {balanceQuery.isLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Загрузка баланса...</Typography>
              </Box>
            ) : balanceQuery.isError ? (
              <AppStatePanel
                tone="error"
                title="Ошибка загрузки баланса"
                description="Не удалось загрузить информацию о балансе"
              />
            ) : balance ? (
              <Box>
                <Typography gutterBottom variant="subtitle1">
                  Финансовый баланс
                </Typography>
                <AppKpiGrid
                  columns={3}
                  items={[
                    {
                      title: "Всего закупок",
                      value: balance.totalPurchases.toLocaleString("ru-RU"),
                    },
                    {
                      title: "Оплачено",
                      value: balance.totalPaid.toLocaleString("ru-RU"),
                      deltaTone: "success",
                    },
                    {
                      title: "Долг",
                      value: balance.balance.toLocaleString("ru-RU"),
                      deltaTone: balance.balance > 0 ? "danger" : "success",
                      delta: balance.balance > 0 ? "Есть долг" : "Расчёт закрыт",
                    },
                  ]}
                />
                {balance.balance > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    <AppButton
                      label="Оплатить"
                      variant="primary"
                      size="md"
                      onClick={() => setPayDrawerOpen(true)}
                    />
                  </Box>
                ) : null}
              </Box>
            ) : null}

            <Divider />

            <Box>
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle1">История платежей</Typography>
                <AppButton
                  label="Оплатить"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPayDrawerOpen(true)}
                />
              </Stack>

              {paymentsQuery.isLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Загрузка платежей...</Typography>
                </Box>
              ) : paymentsQuery.isError ? (
                <AppStatePanel
                  tone="error"
                  title="Ошибка загрузки платежей"
                  description="Не удалось загрузить историю платежей"
                />
              ) : (
                <AppDataTable<SupplierPayment>
                  data={payments}
                  columns={PAYMENT_COLUMNS}
                  rowKey={(row) => row.id}
                  title="Платежи"
                  initialPageSize={5}
                  enableExport={false}
                  enableSettings={false}
                />
              )}
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      <SupplierPaymentDrawer
        open={payDrawerOpen}
        supplierId={supplierId}
        onClose={() => setPayDrawerOpen(false)}
      />
    </>
  );
}
