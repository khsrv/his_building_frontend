"use client";

import { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
// Inline SVG icons to avoid @mui/icons-material dependency
function BankIcon() {
  return (
    <svg aria-hidden fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <path d="M3 10h18M3 14h18M5 6l7-3 7 3M5 6v12h14V6M9 10v4M12 10v4M15 10v4" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg aria-hidden fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <rect height="14" rx="2" width="20" x="2" y="5" />
      <path d="M2 10h20M6 15h2M10 15h4" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg aria-hidden fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <rect height="20" rx="2" width="12" x="6" y="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}
import {
  AppButton,
  AppDrawerForm,
  AppInput,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatCard,
  ShimmerBox,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { useCreateAccountMutation } from "@/modules/finance/presentation/hooks/use-create-account-mutation";
import type { AccountType } from "@/modules/finance/domain/finance";
import type { Account } from "@/modules/finance/domain/finance";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_OPTIONS = [
  { value: "bank_account" as AccountType, label: "Банковский счёт" },
  { value: "cash_register" as AccountType, label: "Касса" },
  { value: "mobile_wallet" as AccountType, label: "Мобильный кошелёк" },
] as const;

const CURRENCY_OPTIONS = [
  { value: "TJS", label: "TJS — Сомони" },
  { value: "USD", label: "USD — Доллар" },
  { value: "RUB", label: "RUB — Рубль" },
] as const;

function accountTypeIcon(type: AccountType) {
  if (type === "bank_account") return <BankIcon />;
  if (type === "cash_register") return <CashIcon />;
  return <MobileIcon />;
}

function accountTypeLabel(type: AccountType): string {
  const found = ACCOUNT_TYPE_OPTIONS.find((o) => o.value === type);
  return found?.label ?? type;
}

function formatBalance(balance: number, currency: string): string {
  return `${balance.toLocaleString("ru-RU")} ${currency}`;
}

// ─── Account card ─────────────────────────────────────────────────────────────

function AccountCard({ account }: { account: Account }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        p: 2,
        boxShadow: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: "text.secondary" }}>{accountTypeIcon(account.type)}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {account.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {accountTypeLabel(account.type)}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
        {formatBalance(account.balance, account.currency)}
      </Typography>
      {account.description ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5 }}>
          {account.description}
        </Typography>
      ) : null}
    </Box>
  );
}

// ─── Create form state ────────────────────────────────────────────────────────

interface CreateFormState {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: string;
  description: string;
}

const INITIAL_FORM: CreateFormState = {
  name: "",
  type: "bank_account",
  currency: "TJS",
  initialBalance: "",
  description: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceAccountsPage() {
  const { data: accounts, isLoading, isError } = useAccountsQuery();
  const createMutation = useCreateAccountMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);

  // Summary: total balance per currency
  const balanceByCurrency = (accounts ?? []).reduce<Record<string, number>>((acc, acct) => {
    const prev = acc[acct.currency] ?? 0;
    return { ...acc, [acct.currency]: prev + acct.balance };
  }, {});

  const summaryItems = Object.entries(balanceByCurrency).map(([currency, total]) => ({
    title: `Итого ${currency}`,
    value: formatBalance(total, currency),
    deltaTone: "success" as const,
  }));

  function handleOpen() {
    setForm(INITIAL_FORM);
    setDrawerOpen(true);
  }

  function handleClose() {
    setDrawerOpen(false);
  }

  function handleSave() {
    if (!form.name.trim() || !form.type || !form.currency) return;

    const initialBalance = form.initialBalance ? parseFloat(form.initialBalance) : undefined;

    const createInput: import("@/modules/finance/domain/finance").CreateAccountInput = {
      name: form.name.trim(),
      type: form.type,
      currency: form.currency,
    };
    if (initialBalance !== undefined && !isNaN(initialBalance)) {
      createInput.initialBalance = initialBalance;
    }
    const trimmedDesc = form.description.trim();
    if (trimmedDesc) {
      createInput.description = trimmedDesc;
    }

    createMutation.mutate(
      createInput,
      {
        onSuccess: () => {
          setDrawerOpen(false);
          setForm(INITIAL_FORM);
        },
      },
    );
  }

  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Счета"
        {...(accounts ? { subtitle: `${accounts.length} счетов` } : {})}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы", href: routes.finance },
          { id: "accounts", label: "Счета" },
        ]}
        actions={<AppButton label="Добавить счёт" variant="primary" size="md" onClick={handleOpen} />}
      />

      {/* Summary KPIs */}
      {summaryItems.length > 0 && (
        <AppKpiGrid
          columns={summaryItems.length > 2 ? 4 : summaryItems.length === 2 ? 2 : 2}
          items={summaryItems}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((n) => (
            <Grid key={n} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ShimmerBox className="h-28 w-full" />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Error */}
      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить список счетов. Попробуйте обновить страницу."
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && accounts?.length === 0 && (
        <AppStatePanel
          tone="empty"
          title="Счета не найдены"
          description="Добавьте первый счёт, чтобы начать учёт финансов."
        />
      )}

      {/* Cards grid */}
      {!isLoading && !isError && accounts && accounts.length > 0 && (
        <Grid container spacing={2}>
          {accounts.map((account) => (
            <Grid key={account.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <AccountCard account={account} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create drawer */}
      <AppDrawerForm
        open={drawerOpen}
        title="Добавить счёт"
        subtitle="Заполните данные нового счёта"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={!form.name.trim() || createMutation.isPending}
        onClose={handleClose}
        onSave={handleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label="Название *"
            value={form.name}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, name: v }))}
            placeholder="Основной расчётный счёт"
          />
          <AppSelect
            label="Тип счёта *"
            id="account-type"
            options={ACCOUNT_TYPE_OPTIONS}
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as AccountType }))}
          />
          <AppSelect
            label="Валюта *"
            id="account-currency"
            options={CURRENCY_OPTIONS}
            value={form.currency}
            onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
          />
          <AppInput
            label="Начальный баланс"
            type="number"
            value={form.initialBalance}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, initialBalance: v }))}
            placeholder="0"
          />
          <AppInput
            label="Описание"
            value={form.description}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, description: v }))}
            placeholder="Необязательное описание"
          />
        </Box>
      </AppDrawerForm>
    </main>
  );
}
