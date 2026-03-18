import { apiClient } from "@/shared/lib/http/api-client";
import type {
  Account,
  AccountType,
  Transaction,
  TransactionType,
  ExpenseCategory,
  IncomeExpenseReport,
  CashFlowReport,
  ReceivablesReport,
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
} from "@/modules/finance/domain/finance";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface AccountDto {
  ID: string;
  TenantID: string;
  Name: string;
  AccountType: string;
  BankName: string;
  AccountNumber: string;
  Currency: string;
  InitialBalance: number;
  CurrentBalance: number;
  ResponsibleUserID: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

interface TransactionDto {
  ID: string;
  TenantID: string;
  TransactionType: string;
  CategoryID: string | null;
  AccountID: string;
  ToAccountID: string | null;
  Amount: number;
  Currency: string;
  ExchangeRate: number;
  AmountInPrimaryCurrency: number;
  Description: string;
  ReferenceType: string;
  ReferenceID: string | null;
  PropertyID: string | null;
  CreatedBy: string;
  TransactionDate: string;
  CreatedAt: string;
}

interface CategoryDto {
  id: string;
  name: string;
  parent_id: string | null;
  parent_name: string | null;
  children_count: number;
}

interface PayableReminderDto {
  id: string;
  payee_type: string;
  payee_name: string;
  amount: number;
  currency: string;
  due_date: string;
  description: string;
  status: string;
  created_at: string;
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

// ─── Type guards ──────────────────────────────────────────────────────────────

function isAccountType(value: string): value is AccountType {
  return ["cash", "bank_account", "card"].includes(value);
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

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapAccountDto(dto: AccountDto): Account {
  return {
    id: dto.ID,
    name: dto.Name,
    type: isAccountType(dto.AccountType) ? dto.AccountType : "bank_account",
    currency: dto.Currency,
    balance: dto.CurrentBalance,
    description: dto.BankName || null,
    createdAt: dto.CreatedAt,
  };
}

function mapTransactionDto(dto: TransactionDto): Transaction {
  return {
    id: dto.ID,
    type: isTransactionType(dto.TransactionType) ? dto.TransactionType : "income",
    amount: dto.Amount,
    currency: dto.Currency,
    accountId: dto.AccountID,
    accountName: "", // API does not return joined account name
    toAccountId: dto.ToAccountID,
    toAccountName: null, // API does not return joined account name
    categoryId: dto.CategoryID,
    categoryName: null, // API does not return joined category name
    description: dto.Description,
    transactionDate: dto.TransactionDate,
    createdAt: dto.CreatedAt,
    createdByName: "", // API does not return joined user name
  };
}

function mapCategoryDto(dto: CategoryDto): ExpenseCategory {
  return {
    id: dto.id,
    name: dto.name,
    parentId: dto.parent_id,
    parentName: dto.parent_name,
    childrenCount: dto.children_count,
  };
}

function mapPayableReminderDto(dto: PayableReminderDto): PayableReminder {
  return {
    id: dto.id,
    payeeType: isPayeeType(dto.payee_type) ? dto.payee_type : "other",
    payeeName: dto.payee_name,
    amount: dto.amount,
    currency: dto.currency,
    dueDate: dto.due_date,
    description: dto.description,
    status: isReminderStatus(dto.status) ? dto.status : "pending",
    createdAt: dto.created_at,
  };
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: readonly T[];
  total: number;
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function fetchAccounts(): Promise<Account[]> {
  const res = await apiClient.get<AccountsListResponseDto>("/api/v1/accounts");
  return (res.data.items ?? []).map(mapAccountDto);
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const body: Record<string, unknown> = {
    name: input.name,
    type: input.type,
    currency: input.currency,
  };
  if (input.initialBalance !== undefined) body["initial_balance"] = input.initialBalance;
  if (input.description !== undefined) body["description"] = input.description;

  const res = await apiClient.post<{ data: AccountDto }>("/api/v1/accounts", body);
  return mapAccountDto(res.data);
}

export async function updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.description !== undefined) body["description"] = input.description;

  const res = await apiClient.patch<{ data: AccountDto }>(`/api/v1/accounts/${id}`, body);
  return mapAccountDto(res.data);
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function fetchTransactions(params?: TransactionListParams): Promise<Transaction[]> {
  const query: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  };
  if (params?.type) query["type"] = params.type;
  if (params?.accountId) query["account_id"] = params.accountId;
  if (params?.dateFrom) query["date_from"] = params.dateFrom;
  if (params?.dateTo) query["date_to"] = params.dateTo;

  const res = await apiClient.get<TransactionsListResponseDto>("/api/v1/transactions", query);
  return (res.data.items ?? []).map(mapTransactionDto);
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const body: Record<string, unknown> = {
    type: input.type,
    amount: input.amount,
    currency: input.currency,
    account_id: input.accountId,
    description: input.description,
    transaction_date: input.transactionDate,
  };
  if (input.toAccountId !== undefined) body["to_account_id"] = input.toAccountId;
  if (input.categoryId !== undefined) body["category_id"] = input.categoryId;
  if (input.referenceId !== undefined) body["reference_id"] = input.referenceId;

  const res = await apiClient.post<{ data: TransactionDto }>("/api/v1/transactions", body);
  return mapTransactionDto(res.data);
}

// ─── Expense Categories ───────────────────────────────────────────────────────

export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const res = await apiClient.get<CategoriesListResponseDto>("/api/v1/expense-categories");
  const items = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
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
  return mapCategoryDto(res.data);
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
  return {
    income: res.data.total_income,
    expense: res.data.total_expense,
    net: res.data.net_profit,
    byCategory: (res.data.by_category ?? []).map((c) => ({
      categoryName: c.category_name,
      amount: c.amount,
    })),
    byMonth: (res.data.by_month ?? []).map((m) => ({
      month: m.month,
      income: m.income,
      expense: m.expense,
    })),
  };
}

export async function fetchCashFlowReport(params?: CashFlowReportParams): Promise<CashFlowReport> {
  const query: Record<string, string | number | boolean | undefined | null> = {};
  if (params?.from) query["from"] = params.from;
  if (params?.to) query["to"] = params.to;

  const res = await apiClient.get<CashFlowReportResponseDto>("/api/v1/reports/cash-flow", query);
  return {
    items: (res.data.items ?? []).map((item) => ({
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
  return {
    total: res.data.total ?? 0,
    items: (res.data.items ?? []).map((item) => ({
      clientName: item.client_name,
      dealNumber: item.deal_number,
      totalDebt: item.total_debt,
      overdueAmount: item.overdue_amount,
      nextPaymentDate: item.next_payment_date,
    })),
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

  const res = await apiClient.get<PayableRemindersListResponseDto>(
    "/api/v1/payable-reminders",
    query,
  );
  const items = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
  return items.filter((item) => Boolean(item?.id)).map(mapPayableReminderDto);
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
  };
  if (input.accountId !== undefined) body["account_id"] = input.accountId;

  const res = await apiClient.post<{ data: PayableReminderDto }>(
    "/api/v1/payable-reminders",
    body,
  );
  return mapPayableReminderDto(res.data);
}

export async function markPayableReminderPaid(id: string): Promise<void> {
  await apiClient.post<unknown>(`/api/v1/payable-reminders/${id}/mark-paid`, {});
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
  const items = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
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
  return mapCurrencyDto(res.data);
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
  return (res.data.items ?? [])
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
  return mapExchangeRateDto(res.data);
}
