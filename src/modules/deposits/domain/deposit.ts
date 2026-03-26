// ─── Deposit domain types ────────────────────────────────────────────────────

export type DepositStatus = "active" | "applied" | "returned";

export interface Deposit {
  readonly id: string;
  readonly depositorName: string;
  readonly depositorPhone: string | null;
  readonly clientId: string | null;
  readonly amount: number;
  readonly currency: string;
  readonly accountId: string | null;
  readonly status: DepositStatus;
  readonly notes: string | null;
  readonly dealId: string | null;
  readonly propertyId: string | null;
  readonly receivedBy: string | null;
  readonly returnedAt: string | null;
  readonly appliedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateDepositInput {
  depositorName: string;
  depositorPhone?: string | undefined;
  clientId?: string | undefined;
  amount: number;
  currency: string;
  accountId?: string | undefined;
  propertyId: string;
  notes?: string | undefined;
}

export interface ReturnDepositInput {
  notes?: string | undefined;
}

export interface ApplyDepositInput {
  dealId: string;
  clientId: string;
  scheduleItemId?: string | undefined;
}

export interface DepositsListParams {
  status?: DepositStatus | undefined;
  clientId?: string | undefined;
  propertyId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface DepositsListResult {
  readonly items: readonly Deposit[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}
