// ─── Unit / Apartment statuses ────────────────────────────────────────────────

export type UnitStatus = "free" | "booked" | "sold" | "reserved" | "unavailable";

export type UnitType = "studio" | "1_room" | "2_room" | "3_room" | "4_room" | "penthouse" | "commercial";

// ─── Building / JK statuses ───────────────────────────────────────────────────

export type BuildingStatus = "planning" | "construction" | "completed" | "suspended";

export type ConstructionStage =
  | "foundation"
  | "frame"
  | "facade"
  | "engineering"     // MEP (mechanical, electrical, plumbing)
  | "finishing"
  | "handover";

// ─── Deal / Sales funnel ──────────────────────────────────────────────────────

export type DealStage =
  | "new_lead"
  | "processing"
  | "meeting"
  | "interested"
  | "booking"
  | "deal_formation"
  | "payment"
  | "completed"
  | "rejected"
  | "deferred";

export type DealSource =
  | "instagram"
  | "facebook"
  | "website"
  | "referral"
  | "direct"
  | "other";

// ─── Payment types ────────────────────────────────────────────────────────────

export type PaymentType =
  | "full_payment"
  | "installment"      // Рассрочка от застройщика
  | "mortgage"          // Ипотека через банк
  | "barter"            // Бартер (квартирой)
  | "combined";         // Комбинированная

export type PaymentStatus = "planned" | "paid" | "overdue" | "partially_paid" | "cancelled";

export type TransactionType = "income" | "expense" | "transfer";

// ─── Land ─────────────────────────────────────────────────────────────────────

export type LandStatus = "searching" | "negotiation" | "acquired" | "in_development" | "completed";

export type LandDealType =
  | "monetary"           // Денежная компенсация
  | "barter"             // Бартер квартирой
  | "combined";          // Комбинированная

// ─── Warehouse & Materials ────────────────────────────────────────────────────

export type MaterialUnit = "tonne" | "m3" | "m2" | "piece" | "package" | "kg" | "litre" | "meter";

export type StockMovementType = "inbound" | "outbound" | "transfer" | "write_off";

// ─── Masters & Contractors ────────────────────────────────────────────────────

export type MasterType = "individual" | "brigade";

export type WorkOrderStatus = "created" | "in_progress" | "completed" | "accepted" | "disputed";

// ─── Currencies ───────────────────────────────────────────────────────────────

export type CurrencyCode = "TJS" | "USD" | "RUB" | "EUR";

export const CURRENCY_CONFIG = {
  TJS: { code: "TJS" as const, symbol: "SM", label: "Сомони", flag: "🇹🇯" },
  USD: { code: "USD" as const, symbol: "$", label: "Доллар", flag: "🇺🇸" },
  RUB: { code: "RUB" as const, symbol: "₽", label: "Рубль", flag: "🇷🇺" },
  EUR: { code: "EUR" as const, symbol: "€", label: "Евро", flag: "🇪🇺" },
} as const;

// ─── Expense categories ───────────────────────────────────────────────────────

export type ExpenseCategory =
  | "land_purchase"
  | "design"
  | "permits"
  | "materials"
  | "labor"
  | "salaries"
  | "rent"
  | "utilities"
  | "marketing"
  | "taxes"
  | "other";

// ─── Notification types ───────────────────────────────────────────────────────

export type NotificationCategory =
  | "new_lead"
  | "payment_received"
  | "payment_overdue"
  | "booking_expiring"
  | "task_assigned"
  | "deal_status_changed"
  | "construction_update"
  | "system";

// ─── Document types ───────────────────────────────────────────────────────────

export type DocumentType =
  | "contract"
  | "receipt"
  | "passport"
  | "permit"
  | "blueprint"
  | "photo"
  | "act"
  | "other";
