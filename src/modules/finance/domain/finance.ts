// ─── Finance Domain Types ─────────────────────────────────────────────────────

export type AccountType = "bank_account" | "cash_register" | "mobile_wallet";
export type TransactionType = "income" | "expense" | "transfer";
export type PayeeType = "supplier" | "contractor" | "master" | "other";
export type ReminderStatus = "pending" | "paid" | "cancelled";

export interface Account {
  readonly id: string;
  readonly name: string;
  readonly type: AccountType;
  readonly currency: string;
  readonly balance: number;
  readonly description: string | null;
  readonly propertyId: string | null;
  readonly createdAt: string;
}

export interface Transaction {
  readonly id: string;
  readonly type: TransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly accountId: string;
  readonly accountName: string;
  readonly toAccountId: string | null;
  readonly toAccountName: string | null;
  readonly categoryId: string | null;
  readonly categoryName: string | null;
  readonly description: string;
  readonly transactionDate: string;
  readonly createdAt: string;
  readonly createdByName: string;
}

export interface ExpenseCategory {
  readonly id: string;
  readonly name: string;
  readonly parentId: string | null;
  readonly parentName: string | null;
  readonly childrenCount: number;
}

export interface IncomeExpenseReport {
  readonly income: number;
  readonly expense: number;
  readonly net: number;
  readonly byCategory: readonly { readonly categoryName: string; readonly amount: number }[];
  readonly byMonth: readonly { readonly month: string; readonly income: number; readonly expense: number }[];
}

export interface CashFlowReport {
  readonly items: readonly {
    readonly date: string;
    readonly income: number;
    readonly expense: number;
    readonly balance: number;
  }[];
}

export interface ReceivablesReport {
  readonly total: number;
  readonly items: readonly {
    readonly clientName: string;
    readonly dealNumber: string;
    readonly totalDebt: number;
    readonly overdueAmount: number;
    readonly nextPaymentDate: string | null;
  }[];
}

export interface PropertyCostRow {
  readonly categoryName: string;
  readonly totalAmount: number;
}

export interface PropertyCostReport {
  readonly items: readonly PropertyCostRow[];
  readonly totalAmount: number;
}

export interface PayableReminder {
  readonly id: string;
  readonly payeeType: PayeeType;
  readonly payeeName: string;
  readonly amount: number;
  readonly currency: string;
  readonly dueDate: string;
  readonly description: string;
  readonly status: ReminderStatus;
  readonly createdAt: string;
}

// ─── Input types for mutations ────────────────────────────────────────────────

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance?: number | undefined;
  description?: string | undefined;
  propertyId?: string | undefined;
}

export interface UpdateAccountInput {
  name?: string | undefined;
  description?: string | undefined;
  propertyId?: string | null | undefined;
}

export interface AccountListParams {
  propertyId?: string | undefined;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  currency: string;
  accountId: string;
  toAccountId?: string | undefined;
  categoryId?: string | undefined;
  description: string;
  transactionDate: string;
  referenceId?: string | undefined;
  propertyId?: string | undefined;
}

export interface BarterSellInput {
  barterAccountId: string;
  cashAccountId: string;
  bookValue: number;
  salePrice: number;
  currency: string;
  description: string;
  propertyId?: string | undefined;
}

export interface BarterSellResult {
  readonly profitLoss: number;
  readonly isProfit: boolean;
}

export interface CreatePayableReminderInput {
  payeeType: PayeeType;
  payeeName: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  accountId?: string | undefined;
}

// ─── Query param types ────────────────────────────────────────────────────────

export interface TransactionListParams {
  type?: TransactionType | undefined;
  accountId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface PayableReminderListParams {
  status?: ReminderStatus | undefined;
  payeeType?: PayeeType | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface IncomeExpenseReportParams {
  from?: string | undefined;
  to?: string | undefined;
  propertyId?: string | undefined;
}

export interface CashFlowReportParams {
  from?: string | undefined;
  to?: string | undefined;
}

// ─── Currency types ──────────────────────────────────────────────────────────

export interface Currency {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly symbol: string | null;
  readonly isPrimary: boolean;
  readonly createdAt: string;
}

export interface ExchangeRate {
  readonly id: string;
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly rate: number;
  readonly effectiveDate: string;
  readonly createdAt: string;
}

export interface CreateCurrencyInput {
  code: string;
  name: string;
  symbol?: string | undefined;
  isPrimary?: boolean | undefined;
}

export interface CreateExchangeRateInput {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
}

export interface ExchangeRateListParams {
  fromCurrency?: string | undefined;
  toCurrency?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

// ─── Expense category input ──────────────────────────────────────────────────

export interface CreateExpenseCategoryInput {
  name: string;
  slug: string;
  parentId?: string | undefined;
  sortOrder?: number | undefined;
}
