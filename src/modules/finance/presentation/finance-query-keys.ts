import type {
  TransactionListParams,
  PayableReminderListParams,
  IncomeExpenseReportParams,
  CashFlowReportParams,
  ExchangeRateListParams,
} from "@/modules/finance/domain/finance";

export const financeKeys = {
  all: ["finance"] as const,

  // Accounts
  accounts: () => ["finance", "accounts"] as const,

  // Transactions
  transactions: () => ["finance", "transactions"] as const,
  transactionList: (params?: TransactionListParams) =>
    ["finance", "transactions", "list", params] as const,

  // Expense categories
  expenseCategories: () => ["finance", "expense-categories"] as const,

  // Reports
  incomeExpenseReport: (params?: IncomeExpenseReportParams) =>
    ["finance", "reports", "income-expense", params] as const,
  cashFlowReport: (params?: CashFlowReportParams) =>
    ["finance", "reports", "cash-flow", params] as const,
  receivablesReport: (propertyId?: string) =>
    ["finance", "reports", "receivables", propertyId] as const,

  // Payable reminders
  payableReminders: () => ["finance", "payable-reminders"] as const,
  payableReminderList: (params?: PayableReminderListParams) =>
    ["finance", "payable-reminders", "list", params] as const,

  // Currencies
  currencies: () => ["finance", "currencies"] as const,

  // Exchange rates
  exchangeRates: (params?: ExchangeRateListParams) => ["finance", "exchange-rates", params] as const,
};
