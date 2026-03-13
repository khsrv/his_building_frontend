"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useDateRangeFilter } from "@/shared/hooks/use-date-range-filter";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { formatDateFull } from "@/shared/lib/format/date-formatter";
import { useI18n } from "@/shared/providers/locale-provider";
import { useNotifier } from "@/shared/providers/notifier-provider";
import {
  AppActionMenu,
  type AppActionMenuGroup,
  AppAuditTimeline,
  AppBody,
  AppBulkActionBar,
  AppButton,
  AppCard,
  AppCaption,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppDateRangePicker,
  AppDrawerForm,
  AppEntityEditor,
  AppEntityEditorGrid,
  AppEntityEditorSection,
  type AppEntityEditorTab,
  AppFileUpload,
  AppInput,
  AppKpiGrid,
  AppNumber,
  AppPageHeader,
  PermissionGate,
  AppSelect,
  AppSmartTextInput,
  AppStatePanel,
  AppStatusBadge,
  AppUrlFilterBar,
  type SmartTextOption,
  AppTabs,
  AppTitle,
  AppWidgetFieldGrid,
  AppWidgetFilterModal,
  AppWidgetMenu,
  type AppWidgetMenuOption,
  ConfirmDialog,
  LocaleSwitcher,
  ResponsiveContainer,
  SectionCard,
  ShimmerBox,
  ThemeModeSwitcher,
} from "@/shared/ui";
import { useBreakpoint } from "@/shared/hooks/use-breakpoint";

const sampleRows = [
  { id: "1", title: "First item", amount: 1250 },
  { id: "2", title: "Second item", amount: 3500 },
  { id: "3", title: "Third item", amount: 740 },
];

interface UserRow {
  id: string;
  role: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface ProfileEditorDraft {
  firstName: string;
  lastName: string;
  email: string;
  language: string;
  birthDate: string;
  gender: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
  facebook: string;
  telegram: string;
  whatsapp: string;
  documentId: string;
  taxId: string;
  addressRegistered: string;
  addressCurrent: string;
  extraField1: string;
  extraField2: string;
  extraField3: string;
  extraField4: string;
}

interface WidgetFilterDraft {
  category: string;
  subcategory: string;
  brand: string;
}

interface AdminGuardDraft {
  name: string;
  note: string;
}

const profileEditorDefaultDraft: ProfileEditorDraft = {
  firstName: "Демо",
  lastName: "",
  email: "demo@pos.tj",
  language: "ru",
  birthDate: "",
  gender: "male",
  phone: "989081065",
  currentPassword: "",
  newPassword: "",
  repeatPassword: "",
  facebook: "",
  telegram: "",
  whatsapp: "",
  documentId: "A01277228",
  taxId: "501003260",
  addressRegistered: "Таджикистан г.Истаравшан",
  addressCurrent: "Истаравшан",
  extraField1: "",
  extraField2: "WhatsApp",
  extraField3: "",
  extraField4: "",
};

const widgetFilterDefaultDraft: WidgetFilterDraft = {
  category: "Аптека",
  subcategory: "Все",
  brand: "Все",
};

const adminGuardDefaultDraft: AdminGuardDraft = {
  name: "Товар #1024",
  note: "Черновик изменений",
};

const demoUsers: readonly UserRow[] = [
  { id: "1", role: "Admin", username: "demo", email: "demo@pos.tj", fullName: "Демо", avatarUrl: "https://i.pravatar.cc/100?img=12" },
  { id: "2", role: "Кассир", username: "faridun", email: "faridun@pos.tj", fullName: "Faridun" },
  { id: "3", role: "Кассир", username: "baha", email: "assalam313@mail.ru", fullName: "Baha Baha" },
  { id: "4", role: "Admin", username: "989081065", email: "989081065@pos.tj", fullName: "Faridun" },
  { id: "5", role: "Кассир", username: "xm", email: "988126263@pos.tj", fullName: "Маъмуров Хушбахт" },
  { id: "6", role: "Кассир", username: "xuseyn", email: "987654321@pos.tj", fullName: "Ҳусейнчон" },
  { id: "7", role: "Кассир", username: "davud", email: "ddavid@gmail.com", fullName: "Довуд Довуд" },
  { id: "8", role: "Кассир", username: "accdd", email: "ddavid@gmail.com", fullName: "acd acd" },
  { id: "9", role: "Кассир", username: "qwerty", email: "qwerty@qwerty.ry", fullName: "qwerty" },
  { id: "10", role: "Бухгалтер", username: "qq", email: "qwerty@qwerty.ty", fullName: "qwerty qwerty" },
  { id: "11", role: "Admin", username: "qq-admin", email: "qwerty@qwerty", fullName: "qwerty qwerty" },
];

function initials(value: string) {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "U";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function hashNumber(value: string) {
  return value.split("").reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0);
}

function AvatarCell({ row }: { row: UserRow }) {
  if (row.avatarUrl) {
    return (
      <Image
        alt={row.username}
        className="h-12 w-12 rounded-full object-cover"
        height={48}
        referrerPolicy="no-referrer"
        src={row.avatarUrl}
        width={48}
      />
    );
  }

  const palette = [
    "bg-info/20 text-info",
    "bg-success/20 text-success",
    "bg-warning/20 text-warning",
    "bg-primary/20 text-primary",
    "bg-danger/20 text-danger",
  ] as const;

  const colorClass = palette[hashNumber(row.id) % palette.length];

  return (
    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-lg font-medium ${colorClass}`}>
      {initials(row.fullName)}
    </span>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-info/15 text-info transition-colors hover:bg-info/25"
        onClick={onEdit}
        type="button"
      >
        ✎
      </button>
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-danger/15 text-danger transition-colors hover:bg-danger/25"
        onClick={onDelete}
        type="button"
      >
        🗑
      </button>
    </div>
  );
}

function ProductIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5v14M6 8h12M5 8l-2 5h4zM21 8l-2 5h4z" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="10" r="4.5" />
      <path d="M12 14.5V21M8 10h8" />
    </svg>
  );
}

function AccountTabIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function SecurityTabIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="11" rx="2" width="16" x="4" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function DocumentTabIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v6h5M10 13h6M10 17h6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="15" rx="2" width="18" x="3" y="5" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="18" rx="2" width="10" x="7" y="3" />
      <path d="M11 17h2" />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 7h8M9 7v2a7 7 0 0 1-4 5M5 14a12 12 0 0 0 8 4M14 6h5M16.5 6a11 11 0 0 0 0 12M14 12h5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 5h18M6 12h12M9 19h6" />
      <circle cx="7" cy="5" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6s9.5 6 9.5 6s-3.5 6-9.5 6s-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M7 4H5a2 2 0 0 0-2 2v2M17 4h2a2 2 0 0 1 2 2v2M7 20H5a2 2 0 0 1-2-2v-2M17 20h2a2 2 0 0 0 2-2v-2" />
      <path d="M8 12h8" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 21l3.5-.8L19 7.7a2.2 2.2 0 0 0 0-3.1l-.6-.6a2.2 2.2 0 0 0-3.1 0L2.8 16.5L2 20z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3l8 4l-8 4l-8-4zM4 11l8 4l8-4M4 15l8 4l8-4" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 4v5h5M4.7 13A8 8 0 1 0 8 6" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 12l9 9l9-9V5H12z" />
      <circle cx="16.5" cy="7.5" r="1" />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 20L20 4M8 7h4a2 2 0 0 1 0 4H8v6M16 17h-3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="13" rx="2" width="13" x="8" y="8" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3v9" />
      <path d="M7.8 5.8a8 8 0 1 0 8.4 0" />
    </svg>
  );
}

const unitOptions: readonly SmartTextOption[] = [
  { value: "Шт", label: "Шт" },
  { value: "Кг", label: "Кг" },
  { value: "Литр", label: "Литр" },
  { value: "М2", label: "М2" },
  { value: "1 пачка", label: "1 пачка" },
];

const productTypeOptions: readonly SmartTextOption[] = [
  { value: "standard", label: "Стандартный" },
  { value: "variant", label: "С вариантом" },
  { value: "combined", label: "Комбинированный" },
];

const placeOptions: readonly SmartTextOption[] = [
  { value: "pos_tj", label: "POS.TJ" },
  { value: "warehouse", label: "Склад" },
  { value: "store_a", label: "Магазин А" },
  { value: "store_b", label: "Магазин Б" },
];

export function StarterShowcase() {
  const { t, locale } = useI18n();
  const notifier = useNotifier();
  const { isMobile, isTablet } = useBreakpoint();

  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productName, setProductName] = useState("Простой инпетер");
  const [unitValue, setUnitValue] = useState("Шт");
  const [productType, setProductType] = useState("standard");
  const [places, setPlaces] = useState<string[]>(["pos_tj", "warehouse"]);
  const [profileSaved, setProfileSaved] = useState<ProfileEditorDraft>(profileEditorDefaultDraft);
  const [profileDraft, setProfileDraft] = useState<ProfileEditorDraft>(profileEditorDefaultDraft);
  const [profileTab, setProfileTab] = useState("account");
  const [profileSaving, setProfileSaving] = useState(false);
  const [widgetCurrencyId, setWidgetCurrencyId] = useState("somoni");
  const [widgetFilterOpen, setWidgetFilterOpen] = useState(false);
  const [widgetFilterDraft, setWidgetFilterDraft] = useState<WidgetFilterDraft>(widgetFilterDefaultDraft);
  const [widgetFilterApplied, setWidgetFilterApplied] = useState<WidgetFilterDraft>(widgetFilterDefaultDraft);
  const [widgetFilterApplying, setWidgetFilterApplying] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRowsCount, setSelectedRowsCount] = useState(3);
  const [uploadFiles, setUploadFiles] = useState<readonly { id: string; file: File }[]>([]);
  const [guardSaved, setGuardSaved] = useState<AdminGuardDraft>(adminGuardDefaultDraft);
  const [guardDraft, setGuardDraft] = useState<AdminGuardDraft>(adminGuardDefaultDraft);

  const dateRange = useDateRangeFilter();

  const filteredRows = useMemo(() => {
    if (!search.trim()) {
      return sampleRows;
    }

    const normalized = search.toLowerCase();
    return sampleRows.filter((row) => row.title.toLowerCase().includes(normalized));
  }, [search]);

  const activeViewportLabel = isMobile
    ? t("responsive.mobile")
    : isTablet
      ? t("responsive.tablet")
      : t("responsive.desktop");

  const userTableColumns = useMemo<readonly AppDataTableColumn<UserRow>[]>(() => {
    return [
      {
        id: "index",
        header: "#",
        align: "left",
        widthClassName: "w-16",
        sortAccessor: (row) => Number(row.id),
        searchAccessor: (row) => row.id,
        exportAccessor: (row) => row.id,
        cell: (row) => row.id,
        defaultPinned: true,
      },
      {
        id: "role",
        header: "Роль",
        sortAccessor: (row) => row.role,
        searchAccessor: (row) => row.role,
        exportAccessor: (row) => row.role,
        cell: (row) => row.role,
      },
      {
        id: "username",
        header: "Имя пользователя",
        sortAccessor: (row) => row.username,
        searchAccessor: (row) => row.username,
        exportAccessor: (row) => row.username,
        cell: (row) => row.username,
      },
      {
        id: "avatar",
        header: "Аватар",
        align: "center",
        canHide: true,
        canPin: false,
        searchAccessor: (row) => row.fullName,
        exportAccessor: (row) => initials(row.fullName),
        cell: (row) => <AvatarCell row={row} />,
      },
      {
        id: "email",
        header: "Эл. почта",
        sortAccessor: (row) => row.email,
        searchAccessor: (row) => row.email,
        exportAccessor: (row) => row.email,
        cell: (row) => row.email,
      },
      {
        id: "fullName",
        header: "ФИО",
        sortAccessor: (row) => row.fullName,
        searchAccessor: (row) => row.fullName,
        exportAccessor: (row) => row.fullName,
        cell: (row) => row.fullName,
      },
      {
        id: "actions",
        header: "Действия",
        align: "center",
        defaultPinned: true,
        canHide: false,
        canPin: true,
        exportAccessor: () => "",
        cell: (row) => (
          <RowActions
            onDelete={() => notifier.error(`Delete ${row.username}`)}
            onEdit={() => notifier.info(`Edit ${row.username}`)}
          />
        ),
      },
    ];
  }, [notifier]);

  const widgetCurrencyOptions = useMemo<readonly AppWidgetMenuOption[]>(
    () => [
      { id: "somoni", label: "Somoni", value: "смн" },
      { id: "ruble", label: "Рубль", value: "₽" },
      { id: "yen", label: "Йен", value: "¥" },
      { id: "usd", label: "USD", value: "$" },
      { id: "custom", label: "qwerty", value: "qw" },
    ],
    [],
  );

  const widgetActionGroups = useMemo<readonly AppActionMenuGroup[]>(
    () => [
      {
        id: "base",
        items: [
          { id: "view", label: t("actionMenu.view"), icon: <EyeIcon /> },
          { id: "barcode", label: t("actionMenu.barcode"), icon: <ScanIcon /> },
          { id: "edit", label: t("actionMenu.edit"), icon: <EditIcon /> },
          {
            id: "delete",
            label: t("actionMenu.delete"),
            icon: <TrashIcon />,
            destructive: true,
          },
        ],
      },
      {
        id: "advanced",
        items: [
          { id: "initial-stock", label: t("actionMenu.initialStock"), icon: <LayersIcon /> },
          { id: "stock-history", label: t("actionMenu.stockHistory"), icon: <HistoryIcon /> },
          { id: "group-prices", label: t("actionMenu.groupPrices"), icon: <TagIcon /> },
          { id: "location-prices", label: t("actionMenu.locationPrices"), icon: <PriceIcon /> },
          { id: "duplicate", label: t("actionMenu.duplicate"), icon: <CopyIcon /> },
          { id: "disable", label: t("actionMenu.disable"), icon: <PowerIcon /> },
        ],
      },
    ],
    [t],
  );

  const widgetSelectedCurrency = useMemo(() => {
    return widgetCurrencyOptions.find((option) => option.id === widgetCurrencyId) ?? widgetCurrencyOptions[0];
  }, [widgetCurrencyId, widgetCurrencyOptions]);

  const profileEditorTabs = useMemo<readonly AppEntityEditorTab[]>(
    () => [
      { id: "account", label: t("editor.tab.account"), icon: <AccountTabIcon /> },
      { id: "security", label: t("editor.tab.security"), icon: <SecurityTabIcon /> },
      { id: "additional", label: t("editor.tab.additional"), icon: <DocumentTabIcon /> },
    ],
    [t],
  );

  const profileIsDirty = useMemo(() => {
    return (Object.keys(profileDraft) as (keyof ProfileEditorDraft)[]).some((key) => {
      return profileDraft[key] !== profileSaved[key];
    });
  }, [profileDraft, profileSaved]);

  const widgetFilterIsDirty = useMemo(() => {
    return (
      widgetFilterDraft.category !== widgetFilterApplied.category
      || widgetFilterDraft.subcategory !== widgetFilterApplied.subcategory
      || widgetFilterDraft.brand !== widgetFilterApplied.brand
    );
  }, [widgetFilterApplied, widgetFilterDraft]);

  const guardIsDirty = useMemo(() => {
    return guardDraft.name !== guardSaved.name || guardDraft.note !== guardSaved.note;
  }, [guardDraft, guardSaved]);

  const demoPermissions = useMemo(() => ["products.view", "products.edit"] as const, []);

  const demoKpis = useMemo(
    () => [
      { title: "Orders", value: "186", delta: "+12.4%", deltaTone: "success" as const },
      { title: "Revenue", value: "239.3 смн", delta: "+8.1%", deltaTone: "success" as const },
      { title: "Expenses", value: "53.1 смн", delta: "-3.2%", deltaTone: "warning" as const },
      { title: "Profit", value: "186.2 смн", delta: "+4.9%", deltaTone: "info" as const },
    ],
    [],
  );

  const auditItems = useMemo(
    () => [
      {
        id: "a1",
        title: "Product updated",
        actor: "demo@pos.tj",
        at: "2026-03-13 14:10",
        description: "Цена изменена с 46 смн на 48 смн",
      },
      {
        id: "a2",
        title: "Stock corrected",
        actor: "manager@pos.tj",
        at: "2026-03-13 13:48",
        description: "Начальный запас обновлен: 120 -> 140",
      },
      {
        id: "a3",
        title: "Entity created",
        actor: "admin@pos.tj",
        at: "2026-03-13 12:01",
        description: "Создана новая карточка товара",
      },
    ],
    [],
  );

  useUnsavedChangesGuard({ enabled: guardIsDirty });

  const updateProfileField = <K extends keyof ProfileEditorDraft>(key: K, value: ProfileEditorDraft[K]) => {
    setProfileDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleProfileReset = () => {
    setProfileDraft(profileSaved);
    notifier.info(t("editor.form.resetNotice"));
  };

  const handleProfileSave = () => {
    setProfileSaving(true);
    window.setTimeout(() => {
      setProfileSaved(profileDraft);
      setProfileSaving(false);
      notifier.success(t("editor.form.savedNotice"));
    }, 700);
  };

  const handleApplyWidgetFilter = () => {
    setWidgetFilterApplying(true);
    window.setTimeout(() => {
      setWidgetFilterApplied(widgetFilterDraft);
      setWidgetFilterApplying(false);
      setWidgetFilterOpen(false);
      notifier.success(t("widget.filter.applied"));
    }, 400);
  };

  const handleSaveGuardDraft = () => {
    setGuardSaved(guardDraft);
    notifier.success("Draft saved");
  };

  const handleResetGuardDraft = () => {
    setGuardDraft(guardSaved);
    notifier.info("Draft reset");
  };

  return (
    <ResponsiveContainer className="space-y-6 py-6" width="wide">
      <SectionCard subtitle={t("starter.subtitle")} title={t("starter.title")}>
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <AppButton label="Primary" onClick={() => notifier.success("Saved successfully")} variant="primary" />
              <AppButton label="Secondary" onClick={() => notifier.info("Info message")} variant="secondary" />
              <AppButton label="Outline" variant="outline" />
              <AppButton label="Text" variant="text" />
              <AppButton label="Delete" onClick={() => setConfirmOpen(true)} variant="destructive" />
            </div>

            <div className="flex flex-wrap gap-2">
              <AppButton label="XS" size="xs" variant="tonal" />
              <AppButton label="SM" size="sm" variant="tonal" />
              <AppButton label="MD" size="md" variant="tonal" />
              <AppButton label="LG" size="lg" variant="tonal" />
              <AppButton
                iconOnly
                aria-label="Open calendar"
                leading={<CalendarIcon />}
                size="md"
                variant="icon"
              />
              <AppButton
                iconOnly
                aria-label="Filter options"
                leading={<FilterIcon />}
                size="md"
                variant="outline"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-[220px_220px]">
              <AppButton isLoading label="Saving..." loadingLabel="Saving..." variant="primary" />
              <AppButton fullWidth label="Full width button" variant="secondary" />
            </div>
          </div>

          <div className="grid gap-3">
            <ThemeModeSwitcher />
            <LocaleSwitcher />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        subtitle="Единый экран для проверки размеров, отступов и поведения всех базовых компонентов"
        title="Starter Review Canvas"
      >
        <AppCrudPageScaffold
          bulkActions={(
            <AppBulkActionBar
              actions={(
                <>
                  <AppButton
                    label="Экспорт"
                    onClick={() => notifier.info("Экспорт выбранных строк")}
                    size="sm"
                    variant="outline"
                  />
                  <AppButton
                    label="Удалить"
                    onClick={() => notifier.error("Удаление выбранных строк")}
                    size="sm"
                    variant="destructive"
                  />
                </>
              )}
              clearLabel="Очистить"
              onClear={() => setSelectedRowsCount(0)}
              selectedCount={selectedRowsCount}
              selectedLabel="строк выбрано"
            />
          )}
          content={(
            <div className="space-y-4">
              <AppKpiGrid columns={4} items={demoKpis} />

              <AppCard title="Фильтры и быстрые виджеты" variant="outlined">
                <div className="grid gap-3 xl:grid-cols-2">
                  <AppDateRangePicker
                    className="max-w-none"
                    locale={locale}
                    mode="range"
                    onApply={(next) => dateRange.setRange(next.startDate, next.endDate)}
                    onClear={dateRange.setAllTime}
                    value={{ startDate: dateRange.startDate, endDate: dateRange.endDate }}
                  />

                  <AppSmartTextInput
                    label="Место"
                    mode="multi"
                    onChangeValue={(next) => {
                      if (Array.isArray(next)) {
                        setPlaces(next);
                        return;
                      }
                      setPlaces(next ? [next] : []);
                    }}
                    options={placeOptions}
                    placeholder="Начните вводить место"
                    prefix={<PinIcon />}
                    value={places}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <AppWidgetMenu
                    onSelectOption={(option) => {
                      setWidgetCurrencyId(option.id);
                      notifier.info(t("widget.currency.changed", { currency: option.label }));
                    }}
                    options={widgetCurrencyOptions}
                    selectedOptionId={widgetCurrencyId}
                    trigger={
                      <span className="inline-flex items-center gap-2">
                        <CurrencyIcon />
                        <span>{widgetSelectedCurrency?.value ?? "смн"}</span>
                      </span>
                    }
                  />

                  <AppActionMenu
                    groups={widgetActionGroups}
                    onSelectItem={(item) => notifier.info(t("actionMenu.selected", { action: item.label }))}
                    triggerLabel={t("actionMenu.trigger")}
                  />

                  <AppButton
                    label={t("widget.filter.open")}
                    leading={<FilterIcon />}
                    onClick={() => {
                      setWidgetFilterDraft(widgetFilterApplied);
                      setWidgetFilterOpen(true);
                    }}
                    variant="secondary"
                  />

                  <AppButton
                    label="Открыть Drawer"
                    onClick={() => setDrawerOpen(true)}
                    variant="outline"
                  />
                </div>
              </AppCard>

              <AppDataTable
                addAction={{
                  label: "Добавить",
                  onClick: () => notifier.success("Add clicked"),
                }}
                columns={userTableColumns}
                data={demoUsers}
                fileNameBase="users-review"
                initialPageSize={5}
                rowKey={(row) => row.id}
              />

              <AppEntityEditor
                activeTabId={profileTab}
                footerHint={profileIsDirty ? "Есть несохраненные изменения" : "Все изменения сохранены"}
                isSaving={profileSaving}
                onResetForm={handleProfileReset}
                onSubmitForm={handleProfileSave}
                onTabChange={setProfileTab}
                resetDisabled={!profileIsDirty}
                resetLabel={t("common.reset")}
                saveDisabled={!profileIsDirty}
                saveLabel={t("common.save")}
                tabs={profileEditorTabs}
              >
                {(activeTabId) => {
                  const sectionDescription = activeTabId === "security"
                    ? t("editor.form.securityDescription")
                    : null;

                  return (
                    <AppEntityEditorSection {...(sectionDescription ? { description: sectionDescription } : {})}>
                      <AppEntityEditorGrid columns={3}>
                        <AppInput
                          label={t("editor.form.firstName")}
                          onChangeValue={(value) => updateProfileField("firstName", value)}
                          value={profileDraft.firstName}
                        />
                        <AppInput
                          label={t("editor.form.email")}
                          onChangeValue={(value) => updateProfileField("email", value)}
                          value={profileDraft.email}
                        />
                        <AppSelect
                          label={t("editor.form.language")}
                          onChange={(event) => updateProfileField("language", event.target.value)}
                          options={[
                            { label: t("locale.ru"), value: "ru" },
                            { label: t("locale.en"), value: "en" },
                            { label: t("locale.tg"), value: "tg" },
                            { label: t("locale.uz"), value: "uz" },
                          ]}
                          value={profileDraft.language}
                        />
                      </AppEntityEditorGrid>
                    </AppEntityEditorSection>
                  );
                }}
              </AppEntityEditor>

              <div className="grid gap-4 xl:grid-cols-2">
                <AppCard title="Form + Guard + Upload" variant="outlined">
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <AppInput
                        label="Entity name"
                        onChangeValue={(value) => setGuardDraft((current) => ({ ...current, name: value }))}
                        value={guardDraft.name}
                      />
                      <AppInput
                        label="Note"
                        onChangeValue={(value) => setGuardDraft((current) => ({ ...current, note: value }))}
                        value={guardDraft.note}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <AppStatusBadge
                        label={guardIsDirty ? "Есть несохраненные изменения" : "Сохранено"}
                        tone={guardIsDirty ? "warning" : "success"}
                      />
                      <PermissionGate
                        requiredPermissions={["products.edit"]}
                        userPermissions={demoPermissions}
                      >
                        <AppStatusBadge label="products.edit: разрешено" tone="info" />
                      </PermissionGate>
                      <PermissionGate
                        fallback={<AppStatusBadge label="products.delete: нет доступа" tone="muted" />}
                        requiredPermissions={["products.delete"]}
                        userPermissions={demoPermissions}
                      >
                        <AppStatusBadge label="products.delete: разрешено" tone="danger" />
                      </PermissionGate>
                    </div>

                    <div className="flex gap-2">
                      <AppButton label="Сохранить draft" onClick={handleSaveGuardDraft} variant="primary" />
                      <AppButton label="Сбросить draft" onClick={handleResetGuardDraft} variant="secondary" />
                    </div>

                    <AppFileUpload
                      maxFileSizeMb={2}
                      maxFiles={3}
                      onChange={setUploadFiles}
                      value={uploadFiles}
                    />
                  </div>
                </AppCard>

                <div className="space-y-4">
                  <AppCard subtitle="Единый формат истории" title="Audit Timeline" variant="outlined">
                    <AppAuditTimeline items={auditItems} />
                  </AppCard>

                  <AppStatePanel
                    actionLabel="Обновить"
                    description="Стандартный блок empty/error/no-access для всех модулей."
                    onAction={() => notifier.info("Reload triggered")}
                    title="Нет данных"
                    tone="empty"
                  />
                </div>
              </div>
            </div>
          )}
          filters={(
            <AppUrlFilterBar
              applyLabel="Применить"
              fields={[
                { key: "search", label: "Поиск", type: "text", placeholder: "Название или код..." },
                {
                  key: "status",
                  label: "Статус",
                  type: "select",
                  options: [
                    { label: "Все", value: "" },
                    { label: "Активный", value: "active" },
                    { label: "Черновик", value: "draft" },
                    { label: "Архив", value: "archived" },
                  ],
                },
                {
                  key: "branch",
                  label: "Локация",
                  type: "select",
                  options: [
                    { label: "Все", value: "" },
                    { label: "POS.TJ", value: "pos" },
                    { label: "Склад", value: "warehouse" },
                  ],
                },
              ]}
              resetLabel="Сбросить"
            />
          )}
          header={(
            <AppPageHeader
              actions={(
                <>
                  <AppButton label="Создать" variant="primary" />
                  <AppButton label="Экспорт" variant="outline" />
                </>
              )}
              breadcrumbs={[
                { id: "dashboard", label: "Dashboard", href: "/dashboard" },
                { id: "review", label: "Starter Review" },
              ]}
              meta={<AppStatusBadge label="Unified UI scale" tone="success" />}
              subtitle="Проверка компонентов в едином compact-стиле"
              title="Starter UI Review"
            />
          )}
        />
      </SectionCard>

      <AppTabs
        tabs={[
          {
            id: "list",
            title: "List",
            badge: filteredRows.length,
            content: (
              <AppCard title="Filters" variant="outlined">
                <div className="space-y-4">
                  <AppInput
                    label={t("common.search")}
                    onChangeValue={setSearch}
                    onDebouncedChange={setSearch}
                    placeholder={t("common.search")}
                    searchMode
                    value={search}
                  />

                  <AppDateRangePicker
                    className="max-w-none"
                    locale={locale}
                    mode="range"
                    onApply={(next) => dateRange.setRange(next.startDate, next.endDate)}
                    onClear={dateRange.setAllTime}
                    value={{ startDate: dateRange.startDate, endDate: dateRange.endDate }}
                  />

                  <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">
                    {dateRange.hasRange && dateRange.startDate && dateRange.endDate
                      ? `${formatDateFull(dateRange.startDate, locale)} - ${formatDateFull(dateRange.endDate, locale)}`
                      : "All time"}
                  </div>

                  <div className="space-y-2">
                    {filteredRows.map((row) => (
                      <div className="flex items-center justify-between rounded-md border border-border p-3" key={row.id}>
                        <span>{row.title}</span>
                        <AppNumber currencyCode="USD" locale={locale} value={row.amount} />
                      </div>
                    ))}

                    {filteredRows.length === 0 ? <AppCaption>{t("common.empty")}</AppCaption> : null}
                  </div>
                </div>
              </AppCard>
            ),
          },
          {
            id: "loading",
            title: "Skeleton",
            content: (
              <AppCard subtitle="Reusable shimmer placeholders" title="Loading UI" variant="outlined">
                <div className="space-y-2">
                  <ShimmerBox className="h-4 w-40" />
                  <ShimmerBox className="h-4 w-56" />
                  <ShimmerBox className="h-16 w-full rounded-xl" />
                </div>
              </AppCard>
            ),
          },
          {
            id: "responsive",
            title: "Responsive",
            content: (
              <AppCard title="Viewport state" variant="outlined">
                <AppTitle className="text-xl">{activeViewportLabel}</AppTitle>
                <AppBody className="pt-2 text-muted-foreground">
                  Mobile-first layout is built-in. Use `ResponsiveContainer`, `useBreakpoint`, and tailwind
                  breakpoints (`sm/md/lg/xl`).
                </AppBody>
              </AppCard>
            ),
          },
          {
            id: "admin-kit",
            title: "Admin Kit",
            content: (
              <div className="space-y-4">
                <AppCrudPageScaffold
                  bulkActions={(
                    <AppBulkActionBar
                      actions={(
                        <>
                          <AppButton
                            label="Export selected"
                            onClick={() => notifier.info("Export selected")}
                            size="sm"
                            variant="outline"
                          />
                          <AppButton
                            label="Delete selected"
                            onClick={() => notifier.error("Delete selected")}
                            size="sm"
                            variant="destructive"
                          />
                        </>
                      )}
                      clearLabel="Clear"
                      onClear={() => setSelectedRowsCount(0)}
                      selectedCount={selectedRowsCount}
                      selectedLabel="rows selected"
                    />
                  )}
                  content={(
                    <div className="space-y-4">
                      <AppKpiGrid columns={4} items={demoKpis} />

                      <AppCard title="Guard + Upload + Drawer" variant="outlined">
                        <div className="grid gap-3 md:grid-cols-2">
                          <AppInput
                            label="Entity name"
                            onChangeValue={(value) => setGuardDraft((current) => ({ ...current, name: value }))}
                            value={guardDraft.name}
                          />
                          <AppInput
                            label="Note"
                            onChangeValue={(value) => setGuardDraft((current) => ({ ...current, note: value }))}
                            value={guardDraft.note}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-3">
                          <AppStatusBadge
                            label={guardIsDirty ? "Unsaved changes" : "Synced"}
                            tone={guardIsDirty ? "warning" : "success"}
                          />
                          <AppButton label="Save draft" onClick={handleSaveGuardDraft} variant="primary" />
                          <AppButton label="Reset draft" onClick={handleResetGuardDraft} variant="secondary" />
                          <AppButton
                            label="Open drawer form"
                            onClick={() => setDrawerOpen(true)}
                            variant="outline"
                          />
                        </div>

                        <div className="pt-4">
                          <AppFileUpload
                            maxFileSizeMb={2}
                            maxFiles={3}
                            onChange={setUploadFiles}
                            value={uploadFiles}
                          />
                        </div>
                      </AppCard>

                      <AppStatePanel
                        actionLabel="Reload"
                        description="Так выглядит стандартный empty/error/no-access блок для всех модулей."
                        onAction={() => notifier.info("Reload triggered")}
                        title="No records found"
                        tone="empty"
                      />
                    </div>
                  )}
                  filters={(
                    <AppUrlFilterBar
                      applyLabel="Apply"
                      fields={[
                        { key: "search", label: "Search", type: "text", placeholder: "Name or code..." },
                        {
                          key: "status",
                          label: "Status",
                          type: "select",
                          options: [
                            { label: "All", value: "" },
                            { label: "Active", value: "active" },
                            { label: "Draft", value: "draft" },
                            { label: "Archived", value: "archived" },
                          ],
                        },
                        {
                          key: "branch",
                          label: "Branch",
                          type: "select",
                          options: [
                            { label: "All", value: "" },
                            { label: "POS.TJ", value: "pos" },
                            { label: "Warehouse", value: "warehouse" },
                          ],
                        },
                      ]}
                      resetLabel="Reset"
                    />
                  )}
                  header={(
                    <AppPageHeader
                      actions={(
                        <>
                          <PermissionGate
                            requiredPermissions={["products.create"]}
                            userPermissions={demoPermissions}
                            fallback={<AppStatusBadge label="No create permission" tone="muted" />}
                          >
                            <AppButton label="Create" variant="primary" />
                          </PermissionGate>
                          <PermissionGate
                            requiredPermissions={["products.edit"]}
                            userPermissions={demoPermissions}
                          >
                            <AppButton label="Edit" variant="outline" />
                          </PermissionGate>
                        </>
                      )}
                      breadcrumbs={[
                        { id: "dashboard", label: "Dashboard", href: "/dashboard" },
                        { id: "products", label: "Products" },
                      ]}
                      meta={<AppStatusBadge label="Active" tone="success" />}
                      subtitle="Reusable page header + RBAC + URL filters scaffold"
                      title="Products"
                    />
                  )}
                  sidebar={(
                    <AppCard subtitle="Who changed what and when" title="Audit Timeline" variant="outlined">
                      <AppAuditTimeline items={auditItems} />
                    </AppCard>
                  )}
                />

              </div>
            ),
          },
          {
            id: "widget-kit",
            title: "Widget Kit",
            content: (
              <div className="space-y-4">
                <AppCard
                  subtitle={t("widget.demo.subtitle")}
                  title={t("widget.demo.title")}
                  variant="outlined"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-[240px] flex-1">
                        <AppInput
                          onChangeValue={setSearch}
                          placeholder={t("common.search")}
                          searchMode
                          value={search}
                        />
                      </div>

                      <AppWidgetMenu
                        onSelectOption={(option) => {
                          setWidgetCurrencyId(option.id);
                          notifier.info(t("widget.currency.changed", { currency: option.label }));
                        }}
                        options={widgetCurrencyOptions}
                        selectedOptionId={widgetCurrencyId}
                        trigger={
                          <span className="inline-flex items-center gap-2">
                            <CurrencyIcon />
                            <span>{widgetSelectedCurrency?.value ?? "смн"}</span>
                          </span>
                        }
                        withBackdrop
                      />

                      <AppButton
                        label={t("widget.filter.open")}
                        leading={<FilterIcon />}
                        onClick={() => {
                          setWidgetFilterDraft(widgetFilterApplied);
                          setWidgetFilterOpen(true);
                        }}
                        variant="secondary"
                      />

                      <AppActionMenu
                        groups={widgetActionGroups}
                        onSelectItem={(item) => notifier.info(t("actionMenu.selected", { action: item.label }))}
                        triggerLabel={t("actionMenu.trigger")}
                        withBackdrop
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                      <Image
                        alt="product"
                        className="h-14 w-14 rounded-lg object-cover"
                        height={56}
                        src="https://i.pravatar.cc/120?img=45"
                        width={56}
                      />
                      <div>
                        <p className="text-base font-semibold text-foreground">Кукуруза 958</p>
                        <p className="text-sm text-muted-foreground">Демо товар для action menu</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                      <p>
                        {t("widget.currency.active")}: <span className="font-medium text-foreground">{widgetSelectedCurrency?.label}</span>
                      </p>
                      <p>
                        {t("widget.filter.summary")}:
                        {" "}
                        <span className="font-medium text-foreground">
                          {widgetFilterApplied.category} / {widgetFilterApplied.subcategory} / {widgetFilterApplied.brand}
                        </span>
                      </p>
                    </div>
                  </div>
                </AppCard>

              </div>
            ),
          },
          {
            id: "table",
            title: "Table",
            content: (
              <AppDataTable
                addAction={{
                  label: "Добавить",
                  onClick: () => notifier.success("Add clicked"),
                }}
                columns={userTableColumns}
                data={demoUsers}
                fileNameBase="users"
                initialPageSize={25}
                rowKey={(row) => row.id}
              />
            ),
          },
          {
            id: "entity-editor",
            title: "Entity Editor",
            content: (
              <AppEntityEditor
                activeTabId={profileTab}
                footerHint={
                  profileIsDirty ? t("editor.form.unsavedChanges") : t("editor.form.synced")
                }
                isSaving={profileSaving}
                onResetForm={handleProfileReset}
                onSubmitForm={handleProfileSave}
                onTabChange={setProfileTab}
                resetDisabled={!profileIsDirty}
                resetLabel={t("common.reset")}
                saveDisabled={!profileIsDirty}
                saveLabel={t("common.save")}
                tabs={profileEditorTabs}
              >
                {(activeTabId) => {
                  if (activeTabId === "account") {
                    return (
                      <AppEntityEditorSection>
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                          <AppEntityEditorGrid columns={2}>
                            <AppInput
                              label={t("editor.form.firstName")}
                              onChangeValue={(value) => updateProfileField("firstName", value)}
                              value={profileDraft.firstName}
                            />
                            <AppInput
                              label={t("editor.form.lastName")}
                              onChangeValue={(value) => updateProfileField("lastName", value)}
                              value={profileDraft.lastName}
                            />
                            <AppInput
                              label={t("editor.form.email")}
                              onChangeValue={(value) => updateProfileField("email", value)}
                              type="email"
                              value={profileDraft.email}
                            />
                            <AppSelect
                              label={t("editor.form.language")}
                              onChange={(event) => updateProfileField("language", event.target.value)}
                              options={[
                                { label: t("locale.ru"), value: "ru" },
                                { label: t("locale.en"), value: "en" },
                                { label: t("locale.tg"), value: "tg" },
                                { label: t("locale.uz"), value: "uz" },
                              ]}
                              value={profileDraft.language}
                            />
                          </AppEntityEditorGrid>

                          <div className="space-y-3 rounded-xl border border-border p-4">
                            <Image
                              alt="profile"
                              className="h-28 w-28 rounded-xl object-cover"
                              height={112}
                              src="https://i.pravatar.cc/200?img=12"
                              width={112}
                            />
                            <div className="flex flex-wrap gap-2">
                              <AppButton
                                label={t("editor.form.uploadPhoto")}
                                onClick={() => notifier.info(t("editor.form.uploadPhotoNotice"))}
                                variant="primary"
                              />
                              <AppButton
                                label={t("common.cancel")}
                                onClick={() => notifier.info(t("editor.form.cancelPhotoNotice"))}
                                variant="secondary"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">{t("editor.form.photoHint")}</p>
                          </div>
                        </div>
                      </AppEntityEditorSection>
                    );
                  }

                  if (activeTabId === "security") {
                    return (
                      <AppEntityEditorSection
                        description={t("editor.form.securityDescription")}
                      >
                        <AppEntityEditorGrid columns={3}>
                          <AppInput
                            label={t("editor.form.currentPassword")}
                            onChangeValue={(value) => updateProfileField("currentPassword", value)}
                            placeholder="••••••••"
                            type="password"
                            value={profileDraft.currentPassword}
                          />
                          <AppInput
                            label={t("editor.form.newPassword")}
                            onChangeValue={(value) => updateProfileField("newPassword", value)}
                            placeholder="••••••••"
                            type="password"
                            value={profileDraft.newPassword}
                          />
                          <AppInput
                            label={t("editor.form.repeatPassword")}
                            onChangeValue={(value) => updateProfileField("repeatPassword", value)}
                            placeholder="••••••••"
                            type="password"
                            value={profileDraft.repeatPassword}
                          />
                        </AppEntityEditorGrid>
                      </AppEntityEditorSection>
                    );
                  }

                  return (
                    <div className="space-y-5">
                      <AppEntityEditorSection>
                        <AppEntityEditorGrid columns={3}>
                          <AppInput
                            label={t("editor.form.birthDate")}
                            onChangeValue={(value) => updateProfileField("birthDate", value)}
                            prefix={<CalendarIcon />}
                            type="date"
                            value={profileDraft.birthDate}
                          />
                          <AppSelect
                            label={t("editor.form.gender")}
                            onChange={(event) => updateProfileField("gender", event.target.value)}
                            options={[
                              { label: t("editor.form.male"), value: "male" },
                              { label: t("editor.form.female"), value: "female" },
                            ]}
                            value={profileDraft.gender}
                          />
                          <AppInput
                            label={t("editor.form.phone")}
                            onChangeValue={(value) => updateProfileField("phone", value)}
                            prefix={<PhoneIcon />}
                            value={profileDraft.phone}
                          />
                        </AppEntityEditorGrid>
                      </AppEntityEditorSection>

                      <AppEntityEditorSection>
                        <AppEntityEditorGrid columns={3}>
                          <AppInput
                            label={t("editor.form.facebook")}
                            onChangeValue={(value) => updateProfileField("facebook", value)}
                            value={profileDraft.facebook}
                          />
                          <AppInput
                            label={t("editor.form.telegram")}
                            onChangeValue={(value) => updateProfileField("telegram", value)}
                            value={profileDraft.telegram}
                          />
                          <AppInput
                            label={t("editor.form.whatsapp")}
                            onChangeValue={(value) => updateProfileField("whatsapp", value)}
                            value={profileDraft.whatsapp}
                          />
                        </AppEntityEditorGrid>
                      </AppEntityEditorSection>

                      <AppEntityEditorSection>
                        <AppEntityEditorGrid columns={3}>
                          <AppInput
                            label={t("editor.form.document")}
                            onChangeValue={(value) => updateProfileField("documentId", value)}
                            value={profileDraft.documentId}
                          />
                          <AppInput
                            label={t("editor.form.taxId")}
                            onChangeValue={(value) => updateProfileField("taxId", value)}
                            value={profileDraft.taxId}
                          />
                          <AppInput
                            label={t("editor.form.registeredAddress")}
                            onChangeValue={(value) => updateProfileField("addressRegistered", value)}
                            value={profileDraft.addressRegistered}
                          />
                        </AppEntityEditorGrid>
                      </AppEntityEditorSection>

                      <AppEntityEditorSection>
                        <AppEntityEditorGrid columns={3}>
                          <AppInput
                            label={t("editor.form.currentAddress")}
                            onChangeValue={(value) => updateProfileField("addressCurrent", value)}
                            value={profileDraft.addressCurrent}
                          />
                          <AppInput
                            label={t("editor.form.extraField2")}
                            onChangeValue={(value) => updateProfileField("extraField2", value)}
                            value={profileDraft.extraField2}
                          />
                          <AppInput
                            label={t("editor.form.extraField3")}
                            onChangeValue={(value) => updateProfileField("extraField3", value)}
                            value={profileDraft.extraField3}
                          />
                        </AppEntityEditorGrid>
                      </AppEntityEditorSection>
                    </div>
                  );
                }}
              </AppEntityEditor>
            ),
          },
          {
            id: "smart-input",
            title: "Smart Input",
            content: (
              <div className="space-y-4">
                <AppCard title="Универсальный TextInput" variant="outlined">
                  <div className="space-y-4">
                    <AppSmartTextInput
                      label="Название продукта"
                      mode="text"
                      onChangeValue={(next) => setProductName(Array.isArray(next) ? next[0] ?? "" : next)}
                      placeholder="Введите название"
                      prefix={<ProductIcon />}
                      required
                      value={productName}
                    />

                    <AppSmartTextInput
                      allowCreate
                      label="Единицы измерения"
                      mode="single"
                      onChangeValue={(next) => setUnitValue(Array.isArray(next) ? next[0] ?? "" : next)}
                      options={unitOptions}
                      placeholder="Введите или выберите единицу"
                      prefix={<ScaleIcon />}
                      value={unitValue}
                    />

                    <AppSmartTextInput
                      label="Тип продукта"
                      mode="select"
                      onChangeValue={(next) => setProductType(Array.isArray(next) ? next[0] ?? "" : next)}
                      options={productTypeOptions}
                      placeholder="Выберите тип"
                      prefix={<BoxIcon />}
                      value={productType}
                    />

                    <AppSmartTextInput
                      label="Место"
                      mode="multi"
                      onChangeValue={(next) => {
                        if (Array.isArray(next)) {
                          setPlaces(next);
                          return;
                        }

                        setPlaces(next ? [next] : []);
                      }}
                      options={placeOptions}
                      placeholder="Начните вводить место"
                      prefix={<PinIcon />}
                      value={places}
                    />
                  </div>
                </AppCard>

                <AppCard subtitle="Текущее состояние контролов" title="Preview" variant="outlined">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Название: {productName || "—"}</p>
                    <p>Единица: {unitValue || "—"}</p>
                    <p>Тип: {productType || "—"}</p>
                    <p>Места: {places.length > 0 ? places.join(", ") : "—"}</p>
                  </div>
                </AppCard>
              </div>
            ),
          },
        ]}
      />

      <AppWidgetFilterModal
        applyDisabled={!widgetFilterIsDirty}
        applyLabel={t("common.apply")}
        closeLabel={t("widget.filter.close")}
        isApplying={widgetFilterApplying}
        onApply={handleApplyWidgetFilter}
        onClose={() => {
          setWidgetFilterOpen(false);
          setWidgetFilterDraft(widgetFilterApplied);
        }}
        open={widgetFilterOpen}
        title={t("widget.filter.title")}
      >
        <AppWidgetFieldGrid columns={1}>
          <AppSelect
            label={t("widget.filter.category")}
            onChange={(event) => setWidgetFilterDraft((current) => ({
              ...current,
              category: event.target.value,
            }))}
            options={[
              { label: "Аптека", value: "Аптека" },
              { label: "Стройматериалы", value: "Стройматериалы" },
              { label: "Одежда", value: "Одежда" },
            ]}
            value={widgetFilterDraft.category}
          />

          <AppSelect
            label={t("widget.filter.subcategory")}
            onChange={(event) => setWidgetFilterDraft((current) => ({
              ...current,
              subcategory: event.target.value,
            }))}
            options={[
              { label: "Все", value: "Все" },
              { label: "Подгруппа 1", value: "Подгруппа 1" },
              { label: "Подгруппа 2", value: "Подгруппа 2" },
            ]}
            value={widgetFilterDraft.subcategory}
          />

          <AppSelect
            label={t("widget.filter.brand")}
            onChange={(event) => setWidgetFilterDraft((current) => ({
              ...current,
              brand: event.target.value,
            }))}
            options={[
              { label: "Все", value: "Все" },
              { label: "POS.TJ", value: "POS.TJ" },
              { label: "qwerty", value: "qwerty" },
            ]}
            value={widgetFilterDraft.brand}
          />
        </AppWidgetFieldGrid>
      </AppWidgetFilterModal>

      <AppDrawerForm
        onClose={() => setDrawerOpen(false)}
        onSave={() => {
          notifier.success("Drawer form saved");
          setDrawerOpen(false);
        }}
        open={drawerOpen}
        saveLabel="Save changes"
        subtitle="Side panel form for quick edits without route change."
        title="Edit Product"
      >
        <div className="space-y-3">
          <AppInput defaultValue="Кукуруза 958" label="Title" />
          <AppInput defaultValue="48" label="Price" />
          <AppSelect
            label="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Draft", value: "draft" },
            ]}
          />
        </div>
      </AppDrawerForm>

      <ConfirmDialog
        cancelText={t("common.cancel")}
        confirmText={isDeleting ? "Deleting..." : t("common.delete")}
        destructive
        message={t("confirm.default_message")}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setIsDeleting(true);
          window.setTimeout(() => {
            setIsDeleting(false);
            setConfirmOpen(false);
            notifier.success("Item deleted");
          }, 900);
        }}
        open={confirmOpen}
        title={t("confirm.default_title")}
      />
    </ResponsiveContainer>
  );
}
