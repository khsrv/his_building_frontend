// ─── Roles ────────────────────────────────────────────────────────────────────
// Matches the 11 roles from Hisob Building TZ

export type UserRole =
  | "super_admin"      // Platform level — manages tenants, billing, global settings
  | "admin_company"    // Tenant level — full access within a tenant
  | "sales_director"   // Sales pipeline, managers KPI, analytics
  | "sales_manager"    // Clients, deals, bookings, documents
  | "accountant"       // Finance, payments, reports
  | "cashier"          // Cash receipts/payments, transactions
  | "warehouse_manager"// Materials, inventory, logistics
  | "foreman"          // Construction: work orders, brigades
  | "broker"           // External: limited to view units + bookings
  | "customer"         // App: own deals, payments, documents
  | "viewer";          // Read-only access

// ─── Permission codes ─────────────────────────────────────────────────────────
// Pattern: module.action

export type PermissionCode =
  // Buildings (ЖК, blocks, floors, units)
  | "buildings.read" | "buildings.create" | "buildings.update" | "buildings.delete"
  | "buildings.units.read" | "buildings.units.create" | "buildings.units.update" | "buildings.units.delete"
  | "buildings.chess_grid.view"
  // Clients
  | "clients.read" | "clients.create" | "clients.update" | "clients.delete"
  | "clients.assign_manager"
  // Deals
  | "deals.read" | "deals.create" | "deals.update" | "deals.delete"
  | "deals.approve" | "deals.change_status"
  | "deals.contracts.generate" | "deals.contracts.view"
  // Payments
  | "payments.read" | "payments.create" | "payments.approve"
  | "payments.schedule.view" | "payments.schedule.edit"
  | "payments.receipts.view"
  // Finance
  | "finance.ledger.read" | "finance.ledger.create"
  | "finance.accounts.read" | "finance.accounts.manage"
  | "finance.exchange_rates.manage"
  | "finance.reports.view"
  // Land
  | "land.read" | "land.create" | "land.update" | "land.delete"
  | "land.deals.manage"
  // Warehouse & materials
  | "warehouse.read" | "warehouse.create" | "warehouse.update"
  | "warehouse.stock_movements"
  | "warehouse.suppliers.manage"
  // Masters & contractors
  | "masters.read" | "masters.create" | "masters.update"
  | "masters.work_orders.manage"
  | "masters.payments.manage"
  // Analytics
  | "analytics.dashboard" | "analytics.reports"
  | "analytics.kpi" | "analytics.finance_reports"
  // Settings
  | "settings.company" | "settings.users" | "settings.roles"
  | "settings.templates" | "settings.integrations"
  // SMS
  | "sms.send" | "sms.templates" | "sms.logs"
  // Documents
  | "documents.read" | "documents.upload" | "documents.delete";

// ─── Role → Permissions mapping ───────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, readonly PermissionCode[]> = {
  super_admin: [
    // All permissions
    "buildings.read", "buildings.create", "buildings.update", "buildings.delete",
    "buildings.units.read", "buildings.units.create", "buildings.units.update", "buildings.units.delete",
    "buildings.chess_grid.view",
    "clients.read", "clients.create", "clients.update", "clients.delete", "clients.assign_manager",
    "deals.read", "deals.create", "deals.update", "deals.delete", "deals.approve", "deals.change_status",
    "deals.contracts.generate", "deals.contracts.view",
    "payments.read", "payments.create", "payments.approve", "payments.schedule.view", "payments.schedule.edit", "payments.receipts.view",
    "finance.ledger.read", "finance.ledger.create", "finance.accounts.read", "finance.accounts.manage",
    "finance.exchange_rates.manage", "finance.reports.view",
    "land.read", "land.create", "land.update", "land.delete", "land.deals.manage",
    "warehouse.read", "warehouse.create", "warehouse.update", "warehouse.stock_movements", "warehouse.suppliers.manage",
    "masters.read", "masters.create", "masters.update", "masters.work_orders.manage", "masters.payments.manage",
    "analytics.dashboard", "analytics.reports", "analytics.kpi", "analytics.finance_reports",
    "settings.company", "settings.users", "settings.roles", "settings.templates", "settings.integrations",
    "sms.send", "sms.templates", "sms.logs",
    "documents.read", "documents.upload", "documents.delete",
  ],

  admin_company: [
    "buildings.read", "buildings.create", "buildings.update", "buildings.delete",
    "buildings.units.read", "buildings.units.create", "buildings.units.update", "buildings.units.delete",
    "buildings.chess_grid.view",
    "clients.read", "clients.create", "clients.update", "clients.delete", "clients.assign_manager",
    "deals.read", "deals.create", "deals.update", "deals.delete", "deals.approve", "deals.change_status",
    "deals.contracts.generate", "deals.contracts.view",
    "payments.read", "payments.create", "payments.approve", "payments.schedule.view", "payments.schedule.edit", "payments.receipts.view",
    "finance.ledger.read", "finance.ledger.create", "finance.accounts.read", "finance.accounts.manage",
    "finance.exchange_rates.manage", "finance.reports.view",
    "land.read", "land.create", "land.update", "land.delete", "land.deals.manage",
    "warehouse.read", "warehouse.create", "warehouse.update", "warehouse.stock_movements", "warehouse.suppliers.manage",
    "masters.read", "masters.create", "masters.update", "masters.work_orders.manage", "masters.payments.manage",
    "analytics.dashboard", "analytics.reports", "analytics.kpi", "analytics.finance_reports",
    "settings.company", "settings.users", "settings.roles", "settings.templates", "settings.integrations",
    "sms.send", "sms.templates", "sms.logs",
    "documents.read", "documents.upload", "documents.delete",
  ],

  sales_director: [
    "buildings.read", "buildings.units.read", "buildings.chess_grid.view",
    "clients.read", "clients.create", "clients.update", "clients.assign_manager",
    "deals.read", "deals.create", "deals.update", "deals.approve", "deals.change_status",
    "deals.contracts.generate", "deals.contracts.view",
    "payments.read", "payments.schedule.view", "payments.receipts.view",
    "analytics.dashboard", "analytics.reports", "analytics.kpi",
    "sms.send",
    "documents.read",
  ],

  sales_manager: [
    "buildings.read", "buildings.units.read", "buildings.chess_grid.view",
    "clients.read", "clients.create", "clients.update",
    "deals.read", "deals.create", "deals.update", "deals.change_status",
    "deals.contracts.generate", "deals.contracts.view",
    "payments.read", "payments.create", "payments.schedule.view", "payments.receipts.view",
    "analytics.dashboard",
    "sms.send",
    "documents.read", "documents.upload",
  ],

  accountant: [
    "buildings.read", "buildings.units.read",
    "clients.read",
    "deals.read", "deals.contracts.view",
    "payments.read", "payments.create", "payments.approve", "payments.schedule.view", "payments.schedule.edit", "payments.receipts.view",
    "finance.ledger.read", "finance.ledger.create", "finance.accounts.read", "finance.accounts.manage",
    "finance.exchange_rates.manage", "finance.reports.view",
    "masters.payments.manage",
    "warehouse.read",
    "analytics.dashboard", "analytics.reports", "analytics.finance_reports",
    "documents.read",
  ],

  cashier: [
    "payments.read", "payments.create", "payments.receipts.view",
    "finance.ledger.read", "finance.ledger.create",
    "finance.accounts.read",
    "analytics.dashboard",
  ],

  warehouse_manager: [
    "warehouse.read", "warehouse.create", "warehouse.update", "warehouse.stock_movements", "warehouse.suppliers.manage",
    "buildings.read",
    "analytics.dashboard",
    "documents.read", "documents.upload",
  ],

  foreman: [
    "buildings.read", "buildings.units.read",
    "masters.read", "masters.create", "masters.update", "masters.work_orders.manage",
    "warehouse.read", "warehouse.stock_movements",
    "analytics.dashboard",
    "documents.read", "documents.upload",
  ],

  broker: [
    "buildings.read", "buildings.units.read", "buildings.chess_grid.view",
    "clients.create",
    "deals.read", "deals.create",
    "analytics.dashboard",
  ],

  customer: [
    "deals.read", "deals.contracts.view",
    "payments.read", "payments.schedule.view", "payments.receipts.view",
    "documents.read",
  ],

  viewer: [
    "buildings.read", "buildings.units.read", "buildings.chess_grid.view",
    "clients.read",
    "deals.read",
    "payments.read", "payments.schedule.view",
    "analytics.dashboard",
    "documents.read",
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve all permissions for given roles */
export function resolvePermissions(roles: readonly UserRole[]): readonly PermissionCode[] {
  const set = new Set<PermissionCode>();
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role];
    if (perms) {
      for (const p of perms) set.add(p);
    }
  }
  return [...set];
}

/** Check if roles grant a specific permission */
export function roleHasPermission(roles: readonly UserRole[], permission: PermissionCode): boolean {
  return roles.some((role) => {
    const perms = ROLE_PERMISSIONS[role];
    return perms?.includes(permission) ?? false;
  });
}
