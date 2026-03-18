/**
 * Sidebar navigation configuration for Hisob Building.
 * Centralized so both AppShell and breadcrumbs can reference it.
 */

import type { ReactNode } from "react";
import type { PermissionCode } from "@/shared/types/permissions";
import { routes } from "@/shared/constants/routes";

// ─── Icons (inline SVG — same style as existing app-shell icons) ──────────────

function DashboardIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="7" rx="1" width="7" x="3" y="3" />
      <rect height="7" rx="1" width="7" x="14" y="3" />
      <rect height="7" rx="1" width="7" x="3" y="14" />
      <rect height="7" rx="1" width="7" x="14" y="14" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 18.5a4 4 0 0 1 6 0" />
    </svg>
  );
}

function DealsIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 3h5v5M21 3l-7 7M8 3H3v5M3 3l7 7M16 21h5v-5M21 21l-7-7M8 21H3v-5M3 21l7-7" />
    </svg>
  );
}

function CashierIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 7h20v13H2zM6 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3M12 11v4M10 13h4" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="20" x="2" y="5" />
      <path d="M2 10h20" />
    </svg>
  );
}

function FinanceIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function LandIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 22l10-10 4 4 6-6M14 22h8v-8" />
    </svg>
  );
}

function WarehouseIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" />
    </svg>
  );
}

function MastersIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="18" rx="2" width="16" x="4" y="3" />
      <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ─── Navigation item type ─────────────────────────────────────────────────────

export interface NavItem {
  readonly id: string;
  readonly labelKey: string; // i18n key
  readonly href?: string;
  readonly icon: ReactNode;
  readonly permission?: PermissionCode; // required to see this item
  readonly children?: readonly NavItem[];
}

// ─── Hisob Building navigation tree ─────────────────────────────────────────────────

export const NAVIGATION_ITEMS: readonly NavItem[] = [
  {
    id: "dashboard",
    labelKey: "nav.dashboard",
    href: routes.dashboard,
    icon: <DashboardIcon />,
  },
  {
    id: "buildings",
    labelKey: "nav.buildings",
    icon: <BuildingIcon />,
    permission: "buildings.read",
    children: [
      { id: "buildings-list", labelKey: "nav.buildings_list", href: routes.buildings, icon: <BuildingIcon />, permission: "buildings.read" },
      { id: "buildings-chess", labelKey: "nav.buildings_chess", href: `${routes.buildings}?view=chess`, icon: <BuildingIcon />, permission: "buildings.chess_grid.view" },
    ],
  },
  {
    id: "clients",
    labelKey: "nav.clients",
    href: routes.clients,
    icon: <ClientsIcon />,
    permission: "clients.read",
  },
  {
    id: "cashier",
    labelKey: "nav.cashier",
    href: routes.cashier,
    icon: <CashierIcon />,
    permission: "deals.create",
  },
  {
    id: "deals",
    labelKey: "nav.deals",
    href: routes.deals,
    icon: <DealsIcon />,
    permission: "deals.read",
  },
  {
    id: "payments",
    labelKey: "nav.payments",
    href: routes.payments,
    icon: <PaymentsIcon />,
    permission: "payments.read",
  },
  {
    id: "calculator",
    labelKey: "nav.calculator",
    href: routes.calculator,
    icon: <CalculatorIcon />,
  },
  {
    id: "finance",
    labelKey: "nav.finance",
    icon: <FinanceIcon />,
    permission: "finance.ledger.read",
    children: [
      { id: "finance-ledger", labelKey: "nav.finance_ledger", href: routes.financeLedger, icon: <FinanceIcon />, permission: "finance.ledger.read" },
      { id: "finance-accounts", labelKey: "nav.finance_accounts", href: routes.financeAccounts, icon: <FinanceIcon />, permission: "finance.accounts.read" },
      { id: "finance-rates", labelKey: "nav.finance_rates", href: routes.financeExchangeRates, icon: <FinanceIcon />, permission: "finance.exchange_rates.manage" },
      { id: "finance-reports", labelKey: "nav.finance_reports", href: routes.financeReports, icon: <FinanceIcon />, permission: "finance.reports.view" },
    ],
  },
  {
    id: "land",
    labelKey: "nav.land",
    href: routes.land,
    icon: <LandIcon />,
    permission: "land.read",
  },
  {
    id: "warehouse",
    labelKey: "nav.warehouse",
    icon: <WarehouseIcon />,
    permission: "warehouse.read",
    children: [
      { id: "warehouse-materials", labelKey: "nav.warehouse_materials", href: routes.warehouseMaterials, icon: <WarehouseIcon />, permission: "warehouse.read" },
      { id: "warehouse-movements", labelKey: "nav.warehouse_movements", href: routes.warehouseMovements, icon: <WarehouseIcon />, permission: "warehouse.stock_movements" },
      { id: "warehouse-suppliers", labelKey: "nav.warehouse_suppliers", href: routes.warehouseSuppliers, icon: <WarehouseIcon />, permission: "warehouse.suppliers.manage" },
    ],
  },
  {
    id: "masters",
    labelKey: "nav.masters",
    icon: <MastersIcon />,
    permission: "masters.read",
    children: [
      { id: "masters-list", labelKey: "nav.masters_list", href: routes.masters, icon: <MastersIcon />, permission: "masters.read" },
      { id: "masters-orders", labelKey: "nav.masters_orders", href: routes.workOrders, icon: <MastersIcon />, permission: "masters.work_orders.manage" },
    ],
  },
  {
    id: "analytics",
    labelKey: "nav.analytics",
    icon: <AnalyticsIcon />,
    permission: "analytics.dashboard",
    children: [
      { id: "analytics-dashboard", labelKey: "nav.analytics_dashboard", href: routes.analytics, icon: <AnalyticsIcon />, permission: "analytics.dashboard" },
      { id: "analytics-reports", labelKey: "nav.analytics_reports", href: routes.analyticsReports, icon: <AnalyticsIcon />, permission: "analytics.reports" },
      { id: "analytics-kpi", labelKey: "nav.analytics_kpi", href: routes.analyticsKpi, icon: <AnalyticsIcon />, permission: "analytics.kpi" },
    ],
  },
  {
    id: "settings",
    labelKey: "nav.settings",
    icon: <SettingsIcon />,
    permission: "settings.company",
    children: [
      { id: "settings-company", labelKey: "nav.settings_company", href: routes.settingsCompany, icon: <SettingsIcon />, permission: "settings.company" },
      { id: "settings-users", labelKey: "nav.settings_users", href: routes.settingsUsers, icon: <SettingsIcon />, permission: "settings.users" },
      { id: "settings-roles", labelKey: "nav.settings_roles", href: routes.settingsRoles, icon: <SettingsIcon />, permission: "settings.roles" },
      { id: "settings-templates", labelKey: "nav.settings_templates", href: routes.settingsTemplates, icon: <SettingsIcon />, permission: "settings.templates" },
    ],
  },
];
