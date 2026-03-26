// ─── Masters domain types ─────────────────────────────────────────────────────

export type MasterType = "individual" | "brigade";

export type WorkOrderStatus = "draft" | "in_progress" | "completed" | "accepted";

// ─── Master ───────────────────────────────────────────────────────────────────

export interface Master {
  readonly id: string;
  /** Mapped from API `FullName` */
  readonly name: string;
  /** Inferred from CompanyName presence; API has no explicit type field */
  readonly type: MasterType;
  readonly phone: string | null;
  readonly specialization: string | null;
  readonly companyName: string | null;
  readonly notes: string | null;
  readonly isActive: boolean;
  /** Kept for backward compat — API does not provide this field */
  readonly dailyRate: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ─── Work Order ───────────────────────────────────────────────────────────────

export interface WorkOrder {
  readonly id: string;
  readonly masterId: string;
  /** Fallback: empty string — API returns only MasterID, no joined name */
  readonly masterName: string;
  readonly propertyId: string;
  /** Fallback: empty string — API returns only PropertyID, no joined name */
  readonly propertyName: string;
  readonly title: string;
  readonly description: string;
  readonly status: WorkOrderStatus;
  readonly plannedAmount: number;
  readonly actualAmount: number | null;
  readonly currency: string;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly acceptedAt: string | null;
  readonly acceptedBy: string | null;
  readonly notes: string | null;
  /** Kept for backward compat — mapped from startedAt */
  readonly plannedStartDate: string;
  /** Kept for backward compat — mapped from completedAt */
  readonly plannedEndDate: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateMasterInput {
  fullName: string;
  phone?: string | undefined;
  specialization?: string | undefined;
  companyName?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateMasterInput {
  fullName?: string | undefined;
  phone?: string | undefined;
  specialization?: string | undefined;
  companyName?: string | undefined;
  notes?: string | undefined;
}

export interface CreateWorkOrderInput {
  masterId: string;
  propertyId: string;
  title: string;
  description?: string | undefined;
  plannedAmount: number;
  currency?: string | undefined;
  startedAt?: string | undefined;
  completedAt?: string | undefined;
}

export interface CompleteWorkOrderInput {
  actualAmount: number;
  notes?: string | undefined;
}

export interface MastersListParams {
  page?: number;
  limit?: number;
  search?: string;
  propertyId?: string | undefined;
}

export interface WorkOrdersListParams {
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
  masterId?: string;
  propertyId?: string;
}
