export const routes = {
  // Public
  home: "/",
  login: "/login",

  // Admin root
  dashboard: "/dashboard",

  // Buildings (ЖК)
  buildings: "/buildings",
  buildingCreate: "/buildings/new",
  buildingDetail: (id: string) => `/buildings/${id}` as const,
  buildingChessGrid: (id: string) => `/buildings/${id}/chess-grid` as const,
  buildingUnits: (id: string) => `/buildings/${id}/units` as const,
  unitDetail: (buildingId: string, unitId: string) =>
    `/buildings/${buildingId}/units/${unitId}` as const,

  // Clients
  clients: "/clients",
  clientCreate: "/clients/new",
  clientDetail: (id: string) => `/clients/${id}` as const,

  // Deals
  deals: "/deals",
  dealDetail: (id: string) => `/deals/${id}` as const,
  dealCreate: "/deals/new",

  // Cashier (deal wizard)
  cashier: "/cashier",

  // Installment calculator
  calculator: "/calculator",

  // Payments
  payments: "/payments",
  paymentSchedule: (dealId: string) => `/deals/${dealId}/payments` as const,

  // Finance
  finance: "/finance",
  financeLedger: "/finance/ledger",
  financeAccounts: "/finance/accounts",
  financeExchangeRates: "/finance/exchange-rates",
  financeReports: "/finance/reports",

  // Land
  land: "/land",
  landDetail: (id: string) => `/land/${id}` as const,

  // Warehouse
  warehouse: "/warehouse",
  warehouseMaterials: "/warehouse/materials",
  warehouseMovements: "/warehouse/movements",
  warehouseSuppliers: "/warehouse/suppliers",

  // Masters & Contractors
  masters: "/masters",
  masterDetail: (id: string) => `/masters/${id}` as const,
  workOrders: "/masters/work-orders",

  // Analytics
  analytics: "/analytics",
  analyticsReports: "/analytics/reports",
  analyticsKpi: "/analytics/kpi",

  // Settings
  settings: "/settings",
  settingsCompany: "/settings/company",
  settingsUsers: "/settings/users",
  settingsRoles: "/settings/roles",
  settingsTemplates: "/settings/templates",
  settingsIntegrations: "/settings/integrations",
} as const;
