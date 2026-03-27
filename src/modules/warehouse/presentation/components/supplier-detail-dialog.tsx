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
import { useSupplierStatementQuery } from "@/modules/warehouse/presentation/hooks/use-supplier-statement-query";
import { SupplierPaymentDrawer } from "@/modules/warehouse/presentation/components/supplier-payment-drawer";
import type { SupplierPayment, SupplierStatementItem } from "@/modules/warehouse/domain/warehouse";
import { useI18n } from "@/shared/providers/locale-provider";

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
  const { locale, t } = useI18n();
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);
  const localeCode = locale === "en" ? "en-US" : "ru-RU";

  const balanceQuery = useSupplierBalanceQuery(supplierId);
  const paymentsQuery = useSupplierPaymentsQuery(supplierId);
  const statementQuery = useSupplierStatementQuery(supplierId);

  const balance = balanceQuery.data;
  const payments = paymentsQuery.data ?? [];
  const statement = statementQuery.data ?? [];
  const paymentColumns: readonly AppDataTableColumn<SupplierPayment>[] = [
    {
      id: "paidAt",
      header: t("warehouse.supplierDetail.columns.date"),
      cell: (row) => new Date(row.paidAt).toLocaleDateString(localeCode),
      sortAccessor: (row) => row.paidAt,
    },
    {
      id: "amount",
      header: t("warehouse.supplierDetail.columns.amount"),
      cell: (row) => `${row.amount.toLocaleString(localeCode)} ${row.currency}`,
      sortAccessor: (row) => row.amount,
      align: "right",
    },
    {
      id: "createdByName",
      header: t("warehouse.supplierDetail.columns.createdBy"),
      cell: (row) => row.createdByName,
    },
    {
      id: "notes",
      header: t("warehouse.fields.notes"),
      cell: (row) => row.notes ?? t("settings.smsTemplates.common.dash"),
    },
  ];
  const statementColumns: readonly AppDataTableColumn<SupplierStatementItem>[] = [
    {
      id: "date",
      header: t("warehouse.supplierDetail.columns.date"),
      cell: (row) => new Date(row.date).toLocaleDateString(localeCode),
      sortAccessor: (row) => row.date,
    },
    {
      id: "type",
      header: t("warehouse.supplierDetail.columns.type"),
      cell: (row) => row.type,
      sortAccessor: (row) => row.type,
    },
    {
      id: "description",
      header: t("warehouse.fields.description"),
      cell: (row) => row.description,
      searchAccessor: (row) => row.description,
    },
    {
      id: "amount",
      header: t("warehouse.supplierDetail.columns.amount"),
      cell: (row) => row.amount.toLocaleString(localeCode),
      sortAccessor: (row) => row.amount,
      align: "right",
    },
    {
      id: "runningDebt",
      header: t("warehouse.supplierDetail.columns.runningDebt"),
      cell: (row) => row.runningDebt.toLocaleString(localeCode),
      sortAccessor: (row) => row.runningDebt,
      align: "right",
    },
  ];

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
            <IconButton aria-label={t("settings.templates.preview.close")} onClick={onClose} size="small">
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
                  <Typography variant="body2">{t("warehouse.supplierDetail.loading.balance")}</Typography>
                </Box>
              ) : balanceQuery.isError ? (
                <AppStatePanel
                  tone="error"
                  title={t("warehouse.supplierDetail.error.balanceTitle")}
                  description={t("warehouse.supplierDetail.error.balanceDescription")}
                />
              ) : balance ? (
                <Box>
                  <Typography gutterBottom variant="subtitle1">
                    {t("warehouse.supplierDetail.balance.title")}
                  </Typography>
                  <AppKpiGrid
                    columns={3}
                    items={[
                      {
                        title: t("warehouse.supplierDetail.balance.totalPurchases"),
                        value: (balance.totalPurchases ?? 0).toLocaleString(localeCode),
                      },
                      {
                        title: t("warehouse.supplierDetail.balance.totalPaid"),
                        value: (balance.totalPaid ?? 0).toLocaleString(localeCode),
                        deltaTone: "success",
                      },
                      {
                        title: t("warehouse.supplierDetail.balance.debt"),
                        value: (balance.balance ?? 0).toLocaleString(localeCode),
                        deltaTone: (balance.balance ?? 0) > 0 ? "danger" : "success",
                        delta: (balance.balance ?? 0) > 0 ? t("warehouse.supplierDetail.balance.hasDebt") : t("warehouse.supplierDetail.balance.closed"),
                      },
                    ]}
                  />
                  {(balance.balance ?? 0) > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      <AppButton
                        label={t("warehouse.supplierPayment.save")}
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
                  label={t("warehouse.supplierPayment.save")}
                  variant="secondary"
                  size="sm"
                  onClick={() => setPayDrawerOpen(true)}
                />
              </Stack>

              {paymentsQuery.isLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">{t("warehouse.supplierDetail.loading.payments")}</Typography>
                </Box>
              ) : paymentsQuery.isError ? (
                <AppStatePanel
                  tone="error"
                  title={t("warehouse.supplierDetail.error.paymentsTitle")}
                  description={t("warehouse.supplierDetail.error.paymentsDescription")}
                />
              ) : (
                <AppDataTable<SupplierPayment>
                  data={payments}
                  columns={paymentColumns}
                  rowKey={(row) => row.id}
                  title={t("warehouse.supplierDetail.paymentsTitle")}
                  initialPageSize={5}
                  enableExport={false}
                  enableSettings={false}
                />
              )}
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ mb: 1 }} variant="subtitle1">
                {t("warehouse.supplierDetail.statementTitle")}
              </Typography>
              {statementQuery.isLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">{t("warehouse.supplierDetail.loading.statement")}</Typography>
                </Box>
              ) : statementQuery.isError ? (
                <AppStatePanel
                  tone="error"
                  title={t("warehouse.supplierDetail.error.statementTitle")}
                  description={t("warehouse.supplierDetail.error.statementDescription")}
                />
              ) : (
                <AppDataTable<SupplierStatementItem>
                  data={statement}
                  columns={statementColumns}
                  rowKey={(row) => `${row.date}-${row.type}-${row.description}-${row.amount}`}
                  title={t("warehouse.supplierDetail.statementTitle")}
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
