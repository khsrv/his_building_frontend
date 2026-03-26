import { apiClient } from "@/shared/lib/http/api-client";
import {
  getResponseData,
  getResponseItems,
  getResponseRecord,
  isApiRecord,
  normalizeApiKeys,
} from "@/shared/lib/http/api-response";
import type {
  Account,
  AccountType,
  Transaction,
  TransactionType,
  ExpenseCategory,
  IncomeExpenseReport,
  CashFlowReport,
  ReceivablesReport,
  PropertyCostReport,
  PayableReminder,
  PayeeType,
  ReminderStatus,
  Currency,
  ExchangeRate,
  CreateAccountInput,
  UpdateAccountInput,
  CreateTransactionInput,
  CreatePayableReminderInput,
  CreateCurrencyInput,
  CreateExchangeRateInput,
  CreateExpenseCategoryInput,
  TransactionListParams,
  PayableReminderListParams,
  IncomeExpenseReportParams,
  CashFlowReportParams,
  ExchangeRateListParams,
  BarterSellInput,
  BarterSellResult,
  TransactionSummary,
  TransactionSummaryParams,
  UpdateTransactionInput,
  StornoTransactionInput,
} from "@/modules/finance/domain/finance";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface AccountDto {
  id: string;
  tenant_id: string;
  name: string;
  account_type: string;
  bank_name: string;
  account_number: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  responsible_user_id: string;
  is_active: boolean;
  property_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface TransactionDto {
  id: string;
  tenant_id: string;
  transaction_type: string;
  category_id: string | null;
  account_id: string;
  to_account_id: string | null;
  amount: number;
  currency: string;
  exchange_rate: number;
  amount_in_primary_currency: number;
  description: string;
  reference_type: string;
  reference_id: string | null;
  property_id: string | null;
  created_by: string;
  transaction_date: string;
  created_at: string;
}

interface CategoryDto {
  id: string;
  name: string;
  parent_id: string | null;
  slug: string;
  sort_order: number;
  is_system: boolean;
  tenant_id: string;
  created_at: string;
}

interface PayableReminderDto {
  id?: string;
  reminder_id?: string;
  payee_type?: string;
  type?: string;
  payee_name?: string;
  name?: string;
  amount?: number;
  total_amount?: number;
  currency?: string;
  due_date?: string;
  date?: string;
  description?: string;
  note?: string;
  status?: string;
  created_at?: string;
  created?: string;
}

interface AccountsListResponseDto {
  data: {
    items: AccountDto[];
  };
}

interface TransactionsListResponseDto {
  data: {
    items: TransactionDto[];
    pagination?: { page: number; limit: number; total: number };
  };
}

interface CategoriesListResponseDto {
  data: CategoryDto[] | { items: CategoryDto[]; pagination?: unknown };
}

interface PayableRemindersListResponseDto {
  data: PayableReminderDto[] | { items: PayableReminderDto[]; pagination?: unknown };
}

interface IncomeExpenseReportResponseDto {
  data: {
    total_income: number;
    total_expense: number;
    net_profit: number;
    by_category?: { category_name: string; amount: number }[];
    by_month?: { month: string; income: number; expense: number }[];
  };
}

interface CashFlowReportResponseDto {
  data: {
    items: { date: string; income: number; expense: number; balance: number }[];
  };
}

interface ReceivablesReportResponseDto {
  data: {
    total: number;
    items: {
      client_name: string;
      deal_number: string;
      total_debt: number;
      overdue_amount: number;
      next_payment_date: string | null;
    }[];
  };
}

interface PropertyCostRowDto {
  category_name: string;
  total_amount: number;
}

// ─── Type guards ──────────────────────────────────────────────────────────────

function isAccountType(value: string): value is AccountType {
  return ["bank_account", "cash_register", "mobile_wallet"].includes(value);
}

function isTransactionType(value: string): value is TransactionType {
  return ["income", "expense", "transfer"].includes(value);
}

function isPayeeType(value: string): value is PayeeType {
  return ["supplier", "contractor", "master", "other"].includes(value);
}

function isReminderStatus(value: string): value is ReminderStatus {
  return ["pending", "paid", "cancelled"].includes(value);
}

function pickFirstString(...values: readonly (string | null | undefined)[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

function pickFirstNumber(...values: readonly (number | null | undefined)[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return 0;
}

function extractItemsFromEnvelope<T>(
  response: unknown,
  containerKeys: readonly string[],
): T[] {
  const normalized = normalizeApiKeys(response);
  const data = getResponseData<unknown>(normalized);
  const candidates: unknown[] = [data];
  if (isApiRecord(data)) {
    candidates.push(data["data"], data["result"], data["payload"], data["list"]);
    for (const key of containerKeys) {
      candidates.push(data[key]);
    }
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
    if (!isApiRecord(candidate)) {
      continue;
    }
    for (const key of containerKeys) {
      const value = candidate[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }
  }

  const fallback = getResponseItems<T>(data, containerKeys);
  if (fallback.length > 0) {
    return fallback;
  }

  const dataRecord = getResponseRecord(data);
  if (!dataRecord) {
    return [];
  }

  for (const [key, value] of Object.entries(dataRecord)) {
    if (!Array.isArray(value)) {
      continue;
    }
    const keyMatched = containerKeys.includes(key);
    const looksLikeObjectList =
      value.length === 0 || value.every((item) => isApiRecord(item));
    if (keyMatched || looksLikeObjectList) {
      return value as T[];
    }
  }

  return [];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapAccountDto(dto: AccountDto): Account {
  return {
    id: dto.id,
    name: dto.name,
    type: isAccountType(dto.account_type) ? dto.account_type : "bank_account",
    currency: dto.currency,
    balance: dto.current_balance ?? dto.initial_balance ?? 0,
    description: dto.bank_name || null,
    propertyId: dto.property_id ?? null,
    createdAt: dto.created_at,
  };
}

function mapTransactionDto(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    type: isTransactionType(dto.transaction_type) ? dto.transaction_type : "income",
    amount: dto.amount,
    currency: dto.currency,
    accountId: dto.account_id,
    accountName: "", // API does not return joined account name
    toAccountId: dto.to_account_id,
    toAccountName: null, // API does not return joined account name
    categoryId: dto.category_id,
    categoryName: null, // API does not return joined category name
    description: dto.description,
    propertyId: dto.property_id ?? null,
    transactionDate: dto.transaction_date,
    createdAt: dto.created_at,
    createdByName: dto.created_by ?? "", // API returns uuid, keep as safe fallback
  };
}

function mapCategoryDto(dto: CategoryDto): ExpenseCategory {
  return {
    id: dto.id,
    name: dto.name,
    parentId: dto.parent_id,
    parentName: null,
    childrenCount: 0,
  };
}

function mapPayableReminderDto(dto: PayableReminderDto): PayableReminder {
  const payeeTypeRaw = pickFirstString(dto.payee_type, dto.type);
  const statusRaw = pickFirstString(dto.status, "pending");
  const payeeName = pickFirstString(dto.payee_name, dto.name, "Без названия");
  const dueDate = pickFirstString(dto.due_date, dto.date);
  const createdAt = pickFirstString(dto.created_at, dto.created, dueDate);
  const id = pickFirstString(dto.id, dto.reminder_id, `${payeeName}:${dueDate}`);

  return {
    id,
    payeeType: isPayeeType(payeeTypeRaw) ? payeeTypeRaw : "other",
    payeeName,
    amount: pickFirstNumber(dto.amount, dto.total_amount),
    currency: pickFirstString(dto.currency, "TJS"),
    dueDate,
    description: pickFirstString(dto.description, dto.note),
    status: isReminderStatus(statusRaw) ? statusRaw : "pending",
    createdAt,
  };
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: readonly T[];
  total: number;
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function fetchAccounts(params?: import("@/modules/finance/domain/finance").AccountListParams): Promise<Account[]> {
  const query: Record<string, string | undefined> = {};
  if (params?.propertyId) query["property_id"] = params.propertyId;
  const res = await apiClient.get<AccountsListResponseDto>("/api/v1/accounts", query);
  const items = getResponseItems<AccountDto>(normalizeApiKeys(res));
  return items.filter((item) => Boolean(item?.id)).map(mapAccountDto);
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const body: Record<string, unknown> = {
    name: input.name,
    account_type: input.type,
    currency: input.currency,
    account_number: "",
    is_active: true,
  };
  if (input.initialBalance !== undefined) body["initial_balance"] = input.initialBalance;
  if (input.description !== undefined) body["bank_name"] = input.description;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;

  const res = await apiClient.post<{ data: AccountDto }>("/api/v1/accounts", body);
  return mapAccountDto(getResponseData<AccountDto>(normalizeApiKeys(res)));
}

export async function updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.description !== undefined) body["bank_name"] = input.description;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;

  const res = await apiClient.patch<{ data: AccountDto }>(`/api/v1/accounts/${id}`, body);
  return mapAccountDto(getResponseData<AccountDto>(normalizeApiKeys(res)));
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function fetchTransactions(params?: TransactionListParams): Promise<Transaction[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.type) query["type"] = params.type;
  if (params?.accountId) query["account_id"] = params.accountId;
  if (params?.propertyId) query["property_id"] = params.propertyId;
  if (params?.dateFrom) query["date_from"] = params.dateFrom;
  if (params?.dateTo) query["date_to"] = params.dateTo;

  const res = await apiClient.get<TransactionsListResponseDto>("/api/v1/transactions", query);
  const items = getResponseItems<TransactionDto>(normalizeApiKeys(res));
  return items.filter((item) => Boolean(item?.id)).map(mapTransactionDto);
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const normalizedDate = input.transactionDate.includes("T")
    ? input.transactionDate.slice(0, 10)
    : input.transactionDate;
  const body: Record<string, unknown> = {
    transaction_type: input.type,
    amount: input.amount,
    currency: input.currency,
    account_id: input.accountId,
    description: input.description ?? "",
    transaction_date: normalizedDate,
  };
  if (input.toAccountId !== undefined) body["to_account_id"] = input.toAccountId;
  if (input.categoryId !== undefined) body["category_id"] = input.categoryId;
  if (input.referenceId !== undefined) body["reference_id"] = input.referenceId;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;

  const res = await apiClient.post<{ data: TransactionDto }>("/api/v1/transactions", body);
  return mapTransactionDto(getResponseData<TransactionDto>(normalizeApiKeys(res)));
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const body: Record<string, unknown> = {};
  if (input.amount !== undefined) body["amount"] = input.amount;
  if (input.description !== undefined) body["description"] = input.description;
  if (input.categoryId !== undefined) body["category_id"] = input.categoryId;
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;

  const res = await apiClient.patch<{ data: TransactionDto }>(
    `/api/v1/transactions/${id}`,
    body,
  );
  return mapTransactionDto(getResponseData<TransactionDto>(normalizeApiKeys(res)));
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/transactions/${id}`);
}

export async function stornoTransaction(
  id: string,
  input: StornoTransactionInput,
): Promise<Transaction> {
  const res = await apiClient.post<{ data: TransactionDto }>(
    `/api/v1/transactions/${id}/storno`,
    { reason: input.reason },
  );
  return mapTransactionDto(getResponseData<TransactionDto>(normalizeApiKeys(res)));
}

// ─── Account Detail ──────────────────────────────────────────────────────────

export async function fetchAccountDetail(id: string): Promise<Account> {
  const res = await apiClient.get<{ data: AccountDto }>(`/api/v1/accounts/${id}`);
  return mapAccountDto(getResponseData<AccountDto>(normalizeApiKeys(res)));
}

// ─── Transaction Summary ─────────────────────────────────────────────────────

export async function fetchTransactionSummary(
  params?: TransactionSummaryParams,
): Promise<TransactionSummary> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (params?.type) query["type"] = params.type;
  if (params?.dateFrom) query["date_from"] = params.dateFrom;
  if (params?.dateTo) query["date_to"] = params.dateTo;
  if (params?.propertyId) query["property_id"] = params.propertyId;
  if (params?.categoryId) query["category_id"] = params.categoryId;

  const res = await apiClient.get<{ data: unknown }>("/api/v1/transactions/summary", query);
  const data = getResponseRecord(normalizeApiKeys(res)) ?? {};

  const byCategoryRaw = data["by_category"];
  const byPropertyRaw = data["by_property"];

  return {
    totalAmount: Number(data["total_amount"] ?? data["total"] ?? 0),
    currency: String(data["currency"] ?? "USD"),
    byCategory: Array.isArray(byCategoryRaw)
      ? byCategoryRaw.map((item: Record<string, unknown>) => ({
          categoryId: String(item["category_id"] ?? ""),
          categoryName: String(item["category_name"] ?? "Без категории"),
          amount: Number(item["amount"] ?? 0),
        }))
      : [],
    byProperty: Array.isArray(byPropertyRaw)
      ? byPropertyRaw.map((item: Record<string, unknown>) => ({
          propertyId: String(item["property_id"] ?? ""),
          propertyName: String(item["property_name"] ?? "Без объекта"),
          amount: Number(item["amount"] ?? 0),
        }))
      : [],
  };
}

// ─── Barter ───────────────────────────────────────────────────────────────────

export async function sellBarterAsset(input: BarterSellInput): Promise<BarterSellResult> {
  const body: Record<string, unknown> = {
    barter_account_id: input.barterAccountId,
    cash_account_id: input.cashAccountId,
    book_value: input.bookValue,
    sale_price: input.salePrice,
    currency: input.currency,
    description: input.description,
  };
  if (input.propertyId !== undefined) body["property_id"] = input.propertyId;

  const res = await apiClient.post<{ data: { profit_loss: number; is_profit: boolean } }>(
    "/api/v1/barter/sell",
    body,
  );
  const data = getResponseData<{ profit_loss: number; is_profit: boolean }>(normalizeApiKeys(res));
  return {
    profitLoss: data.profit_loss ?? 0,
    isProfit: data.is_profit ?? (data.profit_loss ?? 0) >= 0,
  };
}

// ─── Expense Categories ───────────────────────────────────────────────────────

export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const res = await apiClient.get<CategoriesListResponseDto>("/api/v1/expense-categories");
  const items = getResponseItems<CategoryDto>(normalizeApiKeys(res));
  return items.filter((item) => Boolean(item?.id)).map(mapCategoryDto);
}

export async function createExpenseCategory(input: CreateExpenseCategoryInput): Promise<ExpenseCategory> {
  const body: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
  };
  if (input.parentId !== undefined) body["parent_id"] = input.parentId;
  if (input.sortOrder !== undefined) body["sort_order"] = input.sortOrder;

  const res = await apiClient.post<{ data: CategoryDto }>("/api/v1/expense-categories", body);
  return mapCategoryDto(getResponseData<CategoryDto>(normalizeApiKeys(res)));
}

export async function deleteExpenseCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/expense-categories/${id}`);
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function fetchIncomeExpenseReport(
  params?: IncomeExpenseReportParams,
): Promise<IncomeExpenseReport> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (params?.from) query["from"] = params.from;
  if (params?.to) query["to"] = params.to;
  if (params?.propertyId) query["property_id"] = params.propertyId;

  const res = await apiClient.get<IncomeExpenseReportResponseDto>(
    "/api/v1/reports/income-expense",
    query,
  );
  const data = getResponseRecord(normalizeApiKeys(res)) ?? {};
  const byCategoryRaw = data["by_category"];
  const byMonthRaw = data["by_month"];
  const byCategory = Array.isArray(byCategoryRaw) ? byCategoryRaw : [];
  const byMonth = Array.isArray(byMonthRaw) ? byMonthRaw : [];

  return {
    income: Number(data["total_income"] ?? data["income"] ?? 0),
    expense: Number(data["total_expense"] ?? data["expense"] ?? 0),
    net: Number(data["net_profit"] ?? data["net"] ?? 0),
    byCategory: byCategory.map((item) => {
      const record = typeof item === "object" && item !== null
        ? item as Record<string, unknown>
        : {};
      return {
        categoryName: String(record["category_name"] ?? ""),
        amount: Number(record["amount"] ?? 0),
      };
    }),
    byMonth: byMonth.map((item) => {
      const record = typeof item === "object" && item !== null
        ? item as Record<string, unknown>
        : {};
      return {
        month: String(record["month"] ?? ""),
        income: Number(record["income"] ?? 0),
        expense: Number(record["expense"] ?? 0),
      };
    }),
  };
}

export async function fetchCashFlowReport(params?: CashFlowReportParams): Promise<CashFlowReport> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (params?.from) query["from"] = params.from;
  if (params?.to) query["to"] = params.to;
  if (params?.propertyId) query["property_id"] = params.propertyId;

  const res = await apiClient.get<CashFlowReportResponseDto>("/api/v1/reports/cash-flow", query);
  const items = getResponseItems<{ date: string; income: number; expense: number; balance: number }>(
    normalizeApiKeys(res),
  );
  return {
    items: items.map((item) => ({
      date: item.date,
      income: item.income,
      expense: item.expense,
      balance: item.balance,
    })),
  };
}

export async function fetchReceivablesReport(params?: {
  propertyId?: string;
}): Promise<ReceivablesReport> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (params?.propertyId) query["property_id"] = params.propertyId;

  const res = await apiClient.get<ReceivablesReportResponseDto>(
    "/api/v1/reports/receivables",
    query,
  );
  const normalized = normalizeApiKeys(res);
  const data = getResponseRecord(normalized) ?? {};
  const items = getResponseItems<{
    client_name: string;
    deal_number: string;
    total_debt: number;
    overdue_amount: number;
    next_payment_date: string | null;
  }>(normalized);
  return {
    total: Number(data["total"] ?? items.length),
    items: items.map((item) => ({
      clientName: item.client_name,
      dealNumber: item.deal_number,
      totalDebt: item.total_debt,
      overdueAmount: item.overdue_amount,
      nextPaymentDate: item.next_payment_date,
    })),
  };
}

export async function fetchPropertyCostReport(propertyId: string): Promise<PropertyCostReport> {
  const res = await apiClient.get<{ data: { items: PropertyCostRowDto[] } }>(
    `/api/v1/reports/property-cost/${propertyId}`,
  );
  const items = getResponseItems<PropertyCostRowDto>(normalizeApiKeys(res)).map((item) => ({
    categoryName: String(item.category_name ?? ""),
    totalAmount: Number(item.total_amount ?? 0),
  }));

  return {
    items,
    totalAmount: items.reduce((sum, row) => sum + row.totalAmount, 0),
  };
}

// ─── Payable Reminders ────────────────────────────────────────────────────────

export async function fetchPayableReminders(
  params?: PayableReminderListParams,
): Promise<PayableReminder[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.status) query["status"] = params.status;
  if (params?.payeeType) query["payee_type"] = params.payeeType;
  if (params?.propertyId) query["property_id"] = params.propertyId;

  const res = await apiClient.get<PayableRemindersListResponseDto>(
    "/api/v1/payable-reminders",
    query,
  );
  const items = extractItemsFromEnvelope<PayableReminderDto>(res, [
    "items",
    "reminders",
    "payable_reminders",
    "rows",
    "columns",
  ]);
  return items.map(mapPayableReminderDto).filter((item) => item.id.length > 0);
}

export async function createPayableReminder(
  input: CreatePayableReminderInput,
): Promise<PayableReminder> {
  const body: Record<string, unknown> = {
    payee_type: input.payeeType,
    payee_name: input.payeeName,
    amount: input.amount,
    currency: input.currency,
    due_date: input.dueDate,
    description: input.description,
    status: "pending",
  };
  if (input.accountId !== undefined) body["account_id"] = input.accountId;

  const res = await apiClient.post<{ data: PayableReminderDto }>(
    "/api/v1/payable-reminders",
    body,
  );
  return mapPayableReminderDto(getResponseData<PayableReminderDto>(normalizeApiKeys(res)));
}

export async function markPayableReminderPaid(input: { id: string; amount: number }): Promise<void> {
  await apiClient.post<unknown>(`/api/v1/payable-reminders/${input.id}/mark-paid`, {
    amount: input.amount,
  });
}

export async function cancelPayableReminder(id: string): Promise<void> {
  await apiClient.post<unknown>(`/api/v1/payable-reminders/${id}/cancel`, {});
}

export async function deletePayableReminder(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/payable-reminders/${id}`);
}

// ─── Currencies ──────────────────────────────────────────────────────────────

interface CurrencyDto {
  id: string;
  code: string;
  name: string;
  symbol: string | null;
  is_primary: boolean;
  sort_order: number;
  tenant_id: string;
  is_active: boolean;
  created_at: string;
}

function mapCurrencyDto(dto: CurrencyDto): Currency {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    symbol: dto.symbol,
    isPrimary: dto.is_primary,
    createdAt: dto.created_at,
  };
}

export async function fetchCurrencies(): Promise<Currency[]> {
  const res = await apiClient.get<{ data: CurrencyDto[] | { items: CurrencyDto[]; pagination?: unknown } }>("/api/v1/currencies");
  const items = getResponseItems<CurrencyDto>(normalizeApiKeys(res));
  return items.filter((item): item is CurrencyDto => Boolean(item?.id)).map(mapCurrencyDto);
}

export async function createCurrency(input: CreateCurrencyInput): Promise<Currency> {
  const body: Record<string, unknown> = {
    code: input.code,
    name: input.name,
  };
  if (input.symbol !== undefined) body["symbol"] = input.symbol;
  if (input.isPrimary !== undefined) body["is_primary"] = input.isPrimary;

  const res = await apiClient.post<{ data: CurrencyDto }>("/api/v1/currencies", body);
  return mapCurrencyDto(getResponseData<CurrencyDto>(normalizeApiKeys(res)));
}

export async function setPrimaryCurrency(id: string): Promise<void> {
  await apiClient.post(`/api/v1/currencies/${id}/primary`, {});
}

// ─── Exchange Rates ──────────────────────────────────────────────────────────

interface ExchangeRateDto {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  created_at: string;
}

function mapExchangeRateDto(dto: ExchangeRateDto): ExchangeRate {
  return {
    id: dto.id,
    fromCurrency: dto.from_currency,
    toCurrency: dto.to_currency,
    rate: dto.rate,
    effectiveDate: dto.effective_date,
    createdAt: dto.created_at,
  };
}

export async function fetchExchangeRates(params?: ExchangeRateListParams): Promise<ExchangeRate[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 50,
  };
  if (params?.fromCurrency) query["from_currency"] = params.fromCurrency;
  if (params?.toCurrency) query["to_currency"] = params.toCurrency;

  const res = await apiClient.get<{ data: { items: ExchangeRateDto[] } }>("/api/v1/exchange-rates", query);
  const items = getResponseItems<ExchangeRateDto>(normalizeApiKeys(res));
  return items
    .filter((item): item is ExchangeRateDto => Boolean(item?.id))
    .map(mapExchangeRateDto);
}

export async function createExchangeRate(input: CreateExchangeRateInput): Promise<ExchangeRate> {
  const body = {
    from_currency: input.fromCurrency,
    to_currency: input.toCurrency,
    rate: input.rate,
    effective_date: input.effectiveDate,
  };

  const res = await apiClient.post<{ data: ExchangeRateDto }>("/api/v1/exchange-rates", body);
  return mapExchangeRateDto(getResponseData<ExchangeRateDto>(normalizeApiKeys(res)));
}
