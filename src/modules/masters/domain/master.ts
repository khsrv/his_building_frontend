// ─── Masters domain types ─────────────────────────────────────────────────────

export type MasterType = "individual" | "brigade";

export type WorkOrderStatus = "draft" | "in_progress" | "completed" | "accepted";

// ─── Master ───────────────────────────────────────────────────────────────────

export interface Master {
  readonly id: string;
  readonly name: string;
  readonly type: MasterType;
  readonly phone: string | null;
  readonly specialization: string | null;
  readonly dailyRate: number | null;
  readonly createdAt: string;
}

// ─── Work Order ───────────────────────────────────────────────────────────────

export interface WorkOrder {
  readonly id: string;
  readonly masterId: string;
  readonly masterName: string;
  readonly propertyId: string;
  readonly propertyName: string;
  readonly description: string;
  readonly status: WorkOrderStatus;
  readonly plannedAmount: number;
  readonly actualAmount: number | null;
  readonly plannedStartDate: string;
  readonly plannedEndDate: string | null;
  readonly actualEndDate: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateMasterInput {
  name: string;
  type: MasterType;
  phone?: string | undefined;
  specialization?: string | undefined;
  dailyRate?: number | undefined;
}

export interface UpdateMasterInput {
  name?: string | undefined;
  type?: MasterType | undefined;
  phone?: string | undefined;
  specialization?: string | undefined;
  dailyRate?: number | undefined;
}

export interface CreateWorkOrderInput {
  masterId: string;
  propertyId: string;
  description: string;
  plannedAmount: number;
  plannedStartDate: string;
  plannedEndDate?: string | undefined;
}

export interface CompleteWorkOrderInput {
  actualAmount: number;
  notes?: string | undefined;
}

export interface MastersListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface WorkOrdersListParams {
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
  masterId?: string;
  propertyId?: string;
}
