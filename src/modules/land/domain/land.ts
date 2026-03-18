// ─── Land Domain Types ──────────────────────────────────────────────────────

export interface LandPlot {
  readonly id: string;
  readonly address: string;
  readonly cadastralNumber: string | null;
  readonly areaSqm: number | null;
  readonly propertyId: string | null;
  readonly propertyName: string | null;
  readonly status: string;
  readonly notes: string | null;
  readonly createdAt: string;
}

export interface LandOwner {
  readonly id: string;
  readonly landPlotId: string;
  readonly fullName: string;
  readonly phone: string | null;
  readonly passportData: string | null;
  readonly dealType: string;
  readonly moneyAmount: number | null;
  readonly moneyCurrency: string | null;
  readonly barterUnitId: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
}

// ─── Input types for mutations ──────────────────────────────────────────────

export interface CreateLandPlotInput {
  address: string;
  cadastralNumber?: string | undefined;
  areaSqm?: number | undefined;
  propertyId?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateLandPlotInput {
  address?: string | undefined;
  cadastralNumber?: string | undefined;
  areaSqm?: number | undefined;
  status?: string | undefined;
  notes?: string | undefined;
}

export interface CreateLandOwnerInput {
  fullName: string;
  phone?: string | undefined;
  passportData?: string | undefined;
  dealType: string;
  moneyAmount?: number | undefined;
  moneyCurrency?: string | undefined;
  barterUnitId?: string | undefined;
  notes?: string | undefined;
}
