"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Chip, Divider, Grid, Typography } from "@mui/material";

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
  ShimmerBox,
} from "@/shared/ui";
import { IconWallet } from "@/shared/ui/icons/kpi-icons";
import { routes } from "@/shared/constants/routes";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { useCreateAccountMutation } from "@/modules/finance/presentation/hooks/use-create-account-mutation";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import { BarterSellDrawer } from "@/modules/finance/presentation/components/barter-sell-drawer";
import { BarterWriteOffDrawer } from "@/modules/finance/presentation/components/barter-write-off-drawer";
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import type { AccountType, Account } from "@/modules/finance/domain/finance";
import { usePropertyContext } from "@/shared/providers/property-provider";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_OPTIONS = [
  { value: "bank_account" as AccountType, label: "Банковский счёт" },
  { value: "cash_register" as AccountType, label: "Касса" },
  { value: "mobile_wallet" as AccountType, label: "Мобильный кошелёк" },
] as const;


function isBarterAccount(account: Account): boolean {
  return account.name.toLowerCase().includes("бартер");
}

function accountTypeIcon(type: AccountType) {
  if (type === "cash_register") return <CashIcon />;
  if (type === "bank_account") return <BankIcon />;
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

function MoneyAccountCard({
  account,
  propertyName,
  onClick,
}: {
  account: Account;
  propertyName: string | null;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
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
        height: "100%",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": { borderColor: "primary.main", boxShadow: 3 },
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
      <Chip
        label={propertyName ?? "Общий"}
        size="small"
        variant="outlined"
        color={propertyName ? "primary" : "default"}
        sx={{ alignSelf: "flex-start", mt: 0.5 }}
      />
    </Box>
  );
}

function BarterAccountCard({
  account,
  propertyName,
  onSell,
  onWriteOff,
  onClick,
}: {
  account: Account;
  propertyName: string | null;
  onSell: () => void;
  onWriteOff: () => void;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "warning.main",
        bgcolor: "background.paper",
        p: 2,
        boxShadow: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        height: "100%",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": { borderColor: "warning.dark", boxShadow: 3 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: "warning.main" }}>{accountTypeIcon(account.type)}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {account.name}
          </Typography>
          <Chip label="Бартерный актив" size="small" color="warning" sx={{ mt: 0.25 }} />
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
      {propertyName ? (
        <Chip
          label={propertyName}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ alignSelf: "flex-start" }}
        />
      ) : null}
      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
        <AppButton label="Продать" variant="primary" size="sm" onClick={onSell} />
        <AppButton label="Списать на объект" variant="secondary" size="sm" onClick={onWriteOff} />
      </Box>
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
  propertyId: string;
}

const INITIAL_FORM: CreateFormState = {
  name: "",
  type: "bank_account",
  currency: "TJS",
  initialBalance: "",
  description: "",
  propertyId: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceAccountsPage() {
  const router = useRouter();
  const currencyOptions = useCurrencyOptions();
  const createMutation = useCreateAccountMutation();
  const { data: propertiesResult } = usePropertiesListQuery();
  const properties = propertiesResult?.items ?? [];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);

  // Property filter from global context — sent to API for server-side filtering
  const { currentPropertyId } = usePropertyContext();
  const { data: accounts, isLoading, isError } = useAccountsQuery(currentPropertyId || undefined);

  // Barter action state
  const [sellTarget, setSellTarget] = useState<Account | null>(null);
  const [writeOffTarget, setWriteOffTarget] = useState<Account | null>(null);

  const propertyNameMap = new Map<string, string>(
    properties.map((p) => [p.id, p.name] as [string, string]),
  );

  const allAccounts = accounts ?? [];
  const barterAccounts = allAccounts.filter(isBarterAccount);
  const moneyAccounts = allAccounts.filter((a) => !isBarterAccount(a));

  // Cash accounts = non-barter, for sell form
  const cashAccounts = moneyAccounts;

  const barterByCurrency = barterAccounts.reduce<Record<string, number>>((acc, acct) => {
    const prev = acc[acct.currency] ?? 0;
    return { ...acc, [acct.currency]: prev + acct.balance };
  }, {});

  const balanceByCurrency = moneyAccounts.reduce<Record<string, number>>((acc, acct) => {
    const prev = acc[acct.currency] ?? 0;
    return { ...acc, [acct.currency]: prev + acct.balance };
  }, {});

  const summaryItems = Object.entries(balanceByCurrency).map(([currency, total]) => ({
    title: `Итого ${currency}`,
    value: formatBalance(total, currency),
    deltaTone: "success" as const,
    icon: <IconWallet />,
  }));

  const barterSummaryItems = Object.entries(barterByCurrency).map(([currency, total]) => ({
    title: `Бартер ${currency}`,
    value: formatBalance(total, currency),
    deltaTone: "warning" as const,
    icon: <IconWallet />,
  }));

  const propertyOptions = [
    { value: "", label: "Общий (без объекта)" },
    ...properties.map((p) => ({ value: p.id, label: p.name })),
  ];


  function handleOpen() {
    setForm(INITIAL_FORM);
    setDrawerOpen(true);
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
    if (trimmedDesc) createInput.description = trimmedDesc;
    if (form.propertyId) createInput.propertyId = form.propertyId;

    createMutation.mutate(createInput, {
      onSuccess: () => {
        setDrawerOpen(false);
        setForm(INITIAL_FORM);
      },
    });
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Счета"
        {...(accounts ? { subtitle: `${accounts.length} счетов` } : {})}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы", href: routes.finance },
          { id: "accounts", label: "Счета" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <AppButton
              label="Создать счёт для обменных квартир"
              variant="outline"
              size="md"
              onClick={() => {
                setForm({
                  ...INITIAL_FORM,
                  name: "Полученные квартиры (обмен)",
                  type: "cash_register",
                });
                setDrawerOpen(true);
              }}
            />
            <AppButton label="Добавить счёт" variant="primary" size="md" onClick={handleOpen} />
          </div>
        }
      />

      {/* Money KPIs */}
      {summaryItems.length > 0 && (
        <AppKpiGrid
          columns={summaryItems.length > 2 ? 4 : summaryItems.length === 2 ? 2 : 2}
          items={summaryItems}
        />
      )}

      {/* Barter KPIs */}
      {barterSummaryItems.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Бартерные активы
          </Typography>
          <AppKpiGrid
            columns={barterSummaryItems.length > 2 ? 4 : barterSummaryItems.length === 2 ? 2 : 2}
            items={barterSummaryItems}
          />
        </>
      )}

      {isLoading && (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((n) => (
            <Grid key={n} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ShimmerBox className="h-28 w-full" />
            </Grid>
          ))}
        </Grid>
      )}

      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить список счетов. Попробуйте обновить страницу."
        />
      )}

      {!isLoading && !isError && allAccounts.length === 0 && (
        <AppStatePanel
          tone="empty"
          title="Счета не найдены"
          description="Добавьте первый счёт, чтобы начать учёт финансов."
        />
      )}

      {/* ── Денежные счета ── */}
      {!isLoading && !isError && moneyAccounts.length > 0 && (
        <>
          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              Денежные счета
            </Typography>
          </Divider>
          <Grid container spacing={2}>
            {moneyAccounts.map((account) => (
              <Grid key={account.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <MoneyAccountCard
                  account={account}
                  propertyName={account.propertyId ? (propertyNameMap.get(account.propertyId) ?? null) : null}
                  onClick={() => router.push(routes.financeAccountDetail(account.id))}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* ── Бартерные активы ── */}
      {!isLoading && !isError && barterAccounts.length > 0 && (
        <>
          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              Бартерные активы
            </Typography>
          </Divider>
          <Grid container spacing={2}>
            {barterAccounts.map((account) => (
              <Grid key={account.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <BarterAccountCard
                  account={account}
                  propertyName={account.propertyId ? (propertyNameMap.get(account.propertyId) ?? null) : null}
                  onSell={() => setSellTarget(account)}
                  onWriteOff={() => setWriteOffTarget(account)}
                  onClick={() => router.push(routes.financeAccountDetail(account.id))}
                />
              </Grid>
            ))}
          </Grid>
        </>
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
        onClose={() => setDrawerOpen(false)}
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
            options={currencyOptions}
            value={form.currency}
            onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
          />
          <AppSelect
            label="Объект"
            id="account-property"
            options={propertyOptions}
            value={form.propertyId}
            onChange={(e) => setForm((prev) => ({ ...prev, propertyId: e.target.value }))}
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

      {/* Barter sell drawer */}
      {sellTarget !== null && (
        <BarterSellDrawer
          open
          barterAccount={sellTarget}
          cashAccounts={cashAccounts}
          onClose={() => setSellTarget(null)}
        />
      )}

      {/* Barter write-off drawer */}
      {writeOffTarget !== null && (
        <BarterWriteOffDrawer
          open
          barterAccount={writeOffTarget}
          onClose={() => setWriteOffTarget(null)}
        />
      )}
    </main>
  );
}
