"use client";

import { useState } from "react";
import { Box, Stack } from "@mui/material";
import {
  AppChartWidget,
  type AppChartDataPoint,
  AppDataTable,
  type AppDataTableColumn,
  AppInput,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppTabs,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useIncomeExpenseReportQuery } from "@/modules/finance/presentation/hooks/use-income-expense-report-query";
import { useCashFlowReportQuery } from "@/modules/finance/presentation/hooks/use-cash-flow-report-query";
import { useReceivablesReportQuery } from "@/modules/finance/presentation/hooks/use-receivables-report-query";
import { usePropertyCostReportQuery } from "@/modules/finance/presentation/hooks/use-property-cost-report-query";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import type { IncomeExpenseReportParams, PropertyCostRow } from "@/modules/finance/domain/finance";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("ru-RU");
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthAgoIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

// ─── Receivables row type ─────────────────────────────────────────────────────

interface ReceivableRow {
  clientName: string;
  dealNumber: string;
  totalDebt: number;
  overdueAmount: number;
  nextPaymentDate: string | null;
}

const receivablesColumns: readonly AppDataTableColumn<ReceivableRow>[] = [
  {
    id: "clientName",
    header: "Клиент",
    cell: (row) => row.clientName,
    searchAccessor: (row) => row.clientName,
    sortAccessor: (row) => row.clientName,
  },
  {
    id: "dealNumber",
    header: "Договор",
    cell: (row) => row.dealNumber,
    searchAccessor: (row) => row.dealNumber,
  },
  {
    id: "totalDebt",
    header: "Общий долг",
    cell: (row) => formatMoney(row.totalDebt),
    sortAccessor: (row) => row.totalDebt,
    align: "right",
  },
  {
    id: "overdueAmount",
    header: "Просрочено",
    cell: (row) => (
      <span
        style={{
          color: row.overdueAmount > 0 ? "var(--color-danger, #dc2626)" : undefined,
          fontWeight: row.overdueAmount > 0 ? 600 : undefined,
        }}
      >
        {formatMoney(row.overdueAmount)}
      </span>
    ),
    sortAccessor: (row) => row.overdueAmount,
    align: "right",
  },
  {
    id: "nextPaymentDate",
    header: "След. платёж",
    cell: (row) => row.nextPaymentDate ?? "—",
    sortAccessor: (row) => row.nextPaymentDate ?? "",
  },
];

const propertyCostColumns: readonly AppDataTableColumn<PropertyCostRow>[] = [
  {
    id: "categoryName",
    header: "Категория",
    cell: (row) => row.categoryName,
    searchAccessor: (row) => row.categoryName,
    sortAccessor: (row) => row.categoryName,
  },
  {
    id: "totalAmount",
    header: "Сумма",
    cell: (row) => formatMoney(row.totalAmount),
    sortAccessor: (row) => row.totalAmount,
    align: "right",
  },
];

// ─── Tab 1: Income / Expense ──────────────────────────────────────────────────

function IncomeExpenseTab() {
  const [from, setFrom] = useState(monthAgoIso);
  const [to, setTo] = useState(todayIso);

  const params: IncomeExpenseReportParams = {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };

  const { data, isLoading, isError } = useIncomeExpenseReportQuery(params);

  const byMonthData: AppChartDataPoint[] = (data?.byMonth ?? []).map((m) => ({
    label: m.month,
    income: m.income,
    expense: m.expense,
  }));

  const byCategoryData: AppChartDataPoint[] = (data?.byCategory ?? []).map((c) => ({
    label: c.categoryName,
    value: c.amount,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Date filter */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Box sx={{ minWidth: 160 }}>
          <AppInput label="Дата от" type="date" value={from} onChangeValue={setFrom} />
        </Box>
        <Box sx={{ minWidth: 160 }}>
          <AppInput label="Дата до" type="date" value={to} onChangeValue={setTo} />
        </Box>
      </Stack>

      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить отчёт. Попробуйте снова."
        />
      )}

      {!isError && (
        <>
          {/* Summary KPIs */}
          <AppKpiGrid
            columns={3}
            items={[
              {
                title: "Доходы",
                value: `${formatMoney(data?.income ?? 0)} сум`,
                deltaTone: "success",
              },
              {
                title: "Расходы",
                value: `${formatMoney(data?.expense ?? 0)} сум`,
                deltaTone: "danger",
              },
              {
                title: "Чистая прибыль",
                value: `${formatMoney(data?.net ?? 0)} сум`,
                deltaTone: (data?.net ?? 0) >= 0 ? "success" : "danger",
              },
            ]}
          />

          {/* Bar chart by month */}
          <AppChartWidget
            type="bar"
            title="Доходы и расходы по месяцам"
            data={byMonthData}
            series={[
              { key: "income", label: "Доходы", color: "#10B981" },
              { key: "expense", label: "Расходы", color: "#EF4444" },
            ]}
            height={300}
            loading={isLoading}
            formatValue={formatMoney}
          />

          {/* Pie chart by category */}
          {byCategoryData.length > 0 && (
            <AppChartWidget
              type="doughnut"
              title="Расходы по категориям"
              data={byCategoryData}
              series={[{ key: "value", label: "Сумма" }]}
              height={280}
              loading={isLoading}
              formatValue={formatMoney}
            />
          )}
        </>
      )}
    </Box>
  );
}

// ─── Tab 2: Cash Flow ─────────────────────────────────────────────────────────

function CashFlowTab() {
  const [from, setFrom] = useState(monthAgoIso);
  const [to, setTo] = useState(todayIso);

  const { data, isLoading, isError } = useCashFlowReportQuery({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  });

  const chartData: AppChartDataPoint[] = (data?.items ?? []).map((item) => ({
    label: item.date,
    income: item.income,
    expense: item.expense,
    balance: item.balance,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Box sx={{ minWidth: 160 }}>
          <AppInput label="Дата от" type="date" value={from} onChangeValue={setFrom} />
        </Box>
        <Box sx={{ minWidth: 160 }}>
          <AppInput label="Дата до" type="date" value={to} onChangeValue={setTo} />
        </Box>
      </Stack>

      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить отчёт о движении денег."
        />
      )}

      {!isError && (
        <AppChartWidget
          type="line"
          title="Движение денег"
          data={chartData}
          series={[
            { key: "income", label: "Доходы", color: "#10B981" },
            { key: "expense", label: "Расходы", color: "#EF4444" },
            { key: "balance", label: "Баланс", color: "#3B82F6" },
          ]}
          height={320}
          loading={isLoading}
          formatValue={formatMoney}
        />
      )}
    </Box>
  );
}

// ─── Tab 3: Receivables ───────────────────────────────────────────────────────

function ReceivablesTab() {
  const { data, isLoading, isError } = useReceivablesReportQuery();

  const rows: ReceivableRow[] = (data?.items ?? []).map((item) => ({
    clientName: item.clientName,
    dealNumber: item.dealNumber,
    totalDebt: item.totalDebt,
    overdueAmount: item.overdueAmount,
    nextPaymentDate: item.nextPaymentDate,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Total KPI */}
      <AppKpiGrid
        columns={2}
        items={[
          {
            title: "Общая дебиторка",
            value: `${formatMoney(data?.total ?? 0)} сум`,
            deltaTone: "warning",
          },
          { title: "Клиентов с долгом", value: `${rows.length}`, deltaTone: "info" },
        ]}
      />

      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить отчёт по дебиторке."
        />
      )}

      {!isError && isLoading && (
        <AppStatePanel tone="empty" title="Загрузка..." description="Загружаем данные." />
      )}

      {!isError && !isLoading && (
        <AppDataTable<ReceivableRow>
          data={rows}
          columns={receivablesColumns}
          rowKey={(row) => `${row.dealNumber}-${row.clientName}`}
          title="Дебиторская задолженность"
          searchPlaceholder="Поиск по клиенту или договору..."
          enableSettings
        />
      )}
    </Box>
  );
}

function PropertyCostTab() {
  const [propertyId, setPropertyId] = useState("");
  const propertiesQuery = usePropertiesListQuery({ page: 1, limit: 200 });
  const reportQuery = usePropertyCostReportQuery(propertyId || undefined);

  const propertyOptions = [
    { value: "", label: "Выберите объект" },
    ...(propertiesQuery.data?.items ?? []).map((property) => ({
      value: property.id,
      label: property.name,
    })),
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ maxWidth: 360 }}>
        <AppSelect
          id="property-cost-property-select"
          label="Объект"
          value={propertyId}
          options={propertyOptions}
          onChange={(event: { target: { value: string } }) => setPropertyId(event.target.value)}
        />
      </Box>

      {!propertyId ? (
        <AppStatePanel
          tone="empty"
          title="Выберите объект"
          description="Для просмотра себестоимости сначала выберите объект."
        />
      ) : reportQuery.isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить отчёт по себестоимости объекта."
        />
      ) : reportQuery.isLoading ? (
        <AppStatePanel tone="empty" title="Загрузка..." description="Загружаем данные отчёта." />
      ) : (
        <>
          <AppKpiGrid
            columns={2}
            items={[
              {
                title: "Итоговая себестоимость",
                value: `${formatMoney(reportQuery.data?.totalAmount ?? 0)} сум`,
                deltaTone: "warning",
              },
              {
                title: "Категорий",
                value: `${reportQuery.data?.items.length ?? 0}`,
                deltaTone: "info",
              },
            ]}
          />

          <AppDataTable<PropertyCostRow>
            data={[...(reportQuery.data?.items ?? [])]}
            columns={propertyCostColumns}
            rowKey={(row) => row.categoryName}
            title="Себестоимость по категориям"
            enableSettings={false}
            searchPlaceholder="Поиск по категории..."
          />
        </>
      )}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceReportsPage() {
  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Отчёты"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы", href: routes.finance },
          { id: "reports", label: "Отчёты" },
        ]}
      />

      <AppTabs
        tabs={[
          { id: "income-expense", title: "Доходы/Расходы", content: <IncomeExpenseTab /> },
          { id: "cash-flow", title: "Движение денег", content: <CashFlowTab /> },
          { id: "receivables", title: "Дебиторка", content: <ReceivablesTab /> },
          { id: "property-cost", title: "Себестоимость", content: <PropertyCostTab /> },
        ]}
      />
    </main>
  );
}
