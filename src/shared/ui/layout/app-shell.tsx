"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/shared/constants/routes";
import { useI18n } from "@/shared/providers/locale-provider";
import { useThemeMode } from "@/shared/providers/theme-provider";
import type { AppSidebarItem } from "@/shared/ui/layout/app-sidebar";
import { AppSidebar } from "@/shared/ui/layout/app-sidebar";
import { AppTopBar, type AppTopBarAction } from "@/shared/ui/layout/app-top-bar";

interface AppShellProps {
  children: ReactNode;
}

function BrandIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 11l8-6l8 6v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 18.5a4 4 0 0 1 6 0" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 7h18M3 12h18M3 17h18M6 7v12M18 7v12" />
    </svg>
  );
}

function KitchenIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 3v9M8 3v9M5 7h3M15 3v18M12 12h6" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3l8 4l-8 4l-8-4zM4 11l8 4l8-4M4 15l8 4l8-4" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 20V6M6 12l6-6l6 6" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 4v14M6 12l6 6l6-6" />
    </svg>
  );
}

function ExpenseIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
    </svg>
  );
}

function CalendarToolsIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="M16 3v4M8 3v4M3 10h18M18.5 16.5l2 2M18.5 20.5v-2M16.5 18.5h2" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="12" rx="2" width="18" x="3" y="4" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 5h8M8 5v2a8 8 0 0 1-4 6M4 13a14 14 0 0 0 8 4M14 5h6M17 5a12 12 0 0 0 0 14M14 12h6" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 17H4l2-2v-4a6 6 0 0 1 12 0v4l2 2h-5M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M15 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2" />
      <path d="M10 12h11M17 7l5 5l-5 5" />
    </svg>
  );
}

function FlagRuIcon() {
  return (
    <svg aria-hidden className="h-6 w-9 rounded-sm" viewBox="0 0 18 12">
      <rect fill="#ffffff" height="4" width="18" x="0" y="0" />
      <rect fill="#224dbe" height="4" width="18" x="0" y="4" />
      <rect fill="#c8262b" height="4" width="18" x="0" y="8" />
    </svg>
  );
}

function FlagEnIcon() {
  return (
    <svg aria-hidden className="h-6 w-9 rounded-sm" viewBox="0 0 18 12">
      <rect fill="#ffffff" height="12" width="18" x="0" y="0" />
      <rect fill="#b22234" height="1" width="18" x="0" y="0" />
      <rect fill="#b22234" height="1" width="18" x="0" y="2" />
      <rect fill="#b22234" height="1" width="18" x="0" y="4" />
      <rect fill="#b22234" height="1" width="18" x="0" y="6" />
      <rect fill="#b22234" height="1" width="18" x="0" y="8" />
      <rect fill="#b22234" height="1" width="18" x="0" y="10" />
      <rect fill="#3c3b6e" height="7" width="8" x="0" y="0" />
    </svg>
  );
}

function FlagTgIcon() {
  return (
    <svg aria-hidden className="h-6 w-9 rounded-sm" viewBox="0 0 18 12">
      <rect fill="#ce2028" height="4" width="18" x="0" y="0" />
      <rect fill="#ffffff" height="4" width="18" x="0" y="4" />
      <rect fill="#0f8a3b" height="4" width="18" x="0" y="8" />
      <circle cx="9" cy="6" fill="#f5b301" r="1.2" />
    </svg>
  );
}

function FlagUzIcon() {
  return (
    <svg aria-hidden className="h-6 w-9 rounded-sm" viewBox="0 0 18 12">
      <rect fill="#1eb5e8" height="4" width="18" x="0" y="0" />
      <rect fill="#ffffff" height="4" width="18" x="0" y="4" />
      <rect fill="#32a852" height="4" width="18" x="0" y="8" />
      <rect fill="#ce2028" height="0.4" width="18" x="0" y="3.8" />
      <rect fill="#ce2028" height="0.4" width="18" x="0" y="7.8" />
      <circle cx="2.5" cy="2" fill="#ffffff" r="1" />
    </svg>
  );
}

export function AppShell({ children }: AppShellProps) {
  const { t, locale, setLocale } = useI18n();
  const { mode, resolvedMode, setMode } = useThemeMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeNav = searchParams.get("nav") ?? "home";

  const sidebarItems = useMemo<readonly AppSidebarItem[]>(() => {
    return [
      {
        id: "home",
        label: t("nav.home"),
        href: `${routes.admin}?nav=home`,
        icon: <HomeIcon />,
      },
      {
        id: "users",
        label: t("nav.users"),
        icon: <UsersIcon />,
        children: [
          {
            id: "users-list",
            label: t("nav.users_list"),
            href: `${routes.admin}?nav=users-list`,
            icon: <UsersIcon />,
          },
          {
            id: "users-roles",
            label: t("nav.users_roles"),
            href: `${routes.admin}?nav=users-roles`,
            icon: <UsersIcon />,
          },
        ],
      },
      {
        id: "contacts",
        label: t("nav.contacts"),
        href: `${routes.admin}?nav=contacts`,
        icon: <ContactIcon />,
      },
      {
        id: "tables",
        label: t("nav.tables"),
        href: `${routes.admin}?nav=tables`,
        icon: <TableIcon />,
      },
      {
        id: "kitchen",
        label: t("nav.kitchen"),
        href: `${routes.admin}?nav=kitchen`,
        icon: <KitchenIcon />,
      },
      {
        id: "order-status",
        label: t("nav.order_status"),
        href: `${routes.admin}?nav=order-status`,
        icon: <KitchenIcon />,
      },
      {
        id: "orders",
        label: t("nav.orders"),
        href: `${routes.admin}?nav=orders`,
        icon: <StackIcon />,
      },
      {
        id: "products",
        label: t("nav.products"),
        icon: <BoxIcon />,
        children: [
          {
            id: "products-all",
            label: t("nav.products_all"),
            href: `${routes.admin}?nav=products-all`,
            icon: <BoxIcon />,
          },
          {
            id: "products-categories",
            label: t("nav.products_categories"),
            href: `${routes.admin}?nav=products-categories`,
            icon: <BoxIcon />,
          },
        ],
      },
      {
        id: "sales",
        label: t("nav.sales"),
        href: `${routes.admin}?nav=sales`,
        icon: <ArrowUpIcon />,
      },
      {
        id: "purchases",
        label: t("nav.purchases"),
        href: `${routes.admin}?nav=purchases`,
        icon: <ArrowDownIcon />,
      },
      {
        id: "expenses",
        label: t("nav.expenses"),
        href: `${routes.admin}?nav=expenses`,
        icon: <ExpenseIcon />,
      },
    ];
  }, [t]);

  const topBarActions = useMemo<readonly AppTopBarAction[]>(() => {
    return [
      {
        id: "workspace",
        icon: <MonitorIcon />,
        label: "POS",
        active: true,
        title: t("topbar.workspace"),
      },
      {
        id: "locale",
        icon: <LanguageIcon />,
        title: t("topbar.language"),
        menuItems: [
          {
            id: "locale-ru",
            label: t("locale.ru"),
            icon: <FlagRuIcon />,
            active: locale === "ru",
            onClick: () => setLocale("ru"),
          },
          {
            id: "locale-en",
            label: t("locale.en"),
            icon: <FlagEnIcon />,
            active: locale === "en",
            onClick: () => setLocale("en"),
          },
          {
            id: "locale-tg",
            label: t("locale.tg"),
            icon: <FlagTgIcon />,
            active: locale === "tg",
            onClick: () => setLocale("tg"),
          },
          {
            id: "locale-uz",
            label: t("locale.uz"),
            icon: <FlagUzIcon />,
            active: locale === "uz",
            onClick: () => setLocale("uz"),
          },
        ],
      },
      {
        id: "theme",
        icon: <SunIcon />,
        title: t("topbar.theme"),
        menuItems: [
          {
            id: "theme-light",
            label: t("theme.light"),
            icon: <SunIcon />,
            active: resolvedMode === "light",
            onClick: () => setMode("light"),
          },
          {
            id: "theme-dark",
            label: t("theme.dark"),
            icon: <MoonIcon />,
            active: resolvedMode === "dark",
            onClick: () => setMode("dark"),
          },
          {
            id: "theme-system",
            label: t("theme.system"),
            icon: <MonitorIcon />,
            active: mode === "system",
            onClick: () => setMode("system"),
          },
        ],
      },
      {
        id: "notifications",
        icon: <BellIcon />,
        title: t("topbar.notifications"),
      },
    ];
  }, [locale, mode, resolvedMode, setLocale, setMode, t]);

  return (
    <div className="min-h-screen bg-background md:flex">
      <AppSidebar
        activeItemId={activeNav}
        brandIcon={<BrandIcon />}
        brandLabel="POS.TJ"
        items={sidebarItems}
      />

      <div className="flex-1 bg-background">
        <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-6">
          <AppTopBar
            actions={topBarActions}
            className="mb-4"
            leftSlot={
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title={t("topbar.openCalendar")}
                type="button"
              >
                <CalendarToolsIcon />
              </button>
            }
            profile={{
              name: "Демо",
              subtitle: "demo",
              avatarUrl: "https://i.pravatar.cc/100?img=12",
              online: true,
              menuItems: [
                {
                  id: "profile",
                  label: t("topbar.profile"),
                  icon: <ProfileIcon />,
                  tone: "primary",
                  href: `${routes.admin}?nav=profile`,
                },
                {
                  id: "logout",
                  label: t("topbar.logout"),
                  icon: <LogoutIcon />,
                  tone: "danger",
                  onClick: async () => {
                    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
                    router.replace(routes.login);
                    router.refresh();
                  },
                },
              ],
            }}
          />

          {children}
        </div>
      </div>
    </div>
  );
}
