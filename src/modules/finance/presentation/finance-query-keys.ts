import type {
  TransactionListParams,
  TransactionSummaryParams,
  PayableReminderListParams,
  IncomeExpenseReportParams,
  CashFlowReportParams,
  ExchangeRateListParams,
  AccountListParams,
} from "@/modules/finance/domain/finance";

export const financeKeys = {
  all: ["finance"] as const,

  // Accounts
  accounts: (params?: AccountListParams) => ["finance", "accounts", params] as const,
  accountDetail: (id: string) => ["finance", "accounts", id] as const,

  // Transactions
  transactions: () => ["finance", "transactions"] as const,
  transactionList: (params?: TransactionListParams) =>
    ["finance", "transactions", "list", params] as const,

  // Transaction summary
  transactionSummary: (params?: TransactionSummaryParams) =>
    ["finance", "transactions", "summary", params] as const,

  // Expense categories
  expenseCategories: () => ["finance", "expense-categories"] as const,

  // Reports
  incomeExpenseReport: (params?: IncomeExpenseReportParams) =>
    ["finance", "reports", "income-expense", params] as const,
  cashFlowReport: (params?: CashFlowReportParams) =>
    ["finance", "reports", "cash-flow", params] as const,
  receivablesReport: (propertyId?: string) =>
    ["finance", "reports", "receivables", propertyId] as const,
  propertyCostReport: (propertyId?: string) =>
    ["finance", "reports", "property-cost", propertyId] as const,

  // Payable reminders
  payableReminders: () => ["finance", "payable-reminders"] as const,
  payableReminderList: (params?: PayableReminderListParams) =>
    ["finance", "payable-reminders", "list", params] as const,

  // Currencies
  currencies: () => ["finance", "currencies"] as const,

  // Exchange rates
  exchangeRates: (params?: ExchangeRateListParams) => ["finance", "exchange-rates", params] as const,
};
