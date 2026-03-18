// ─── Client domain types ──────────────────────────────────────────────────────

export type ClientSource =
  | "website"
  | "phone"
  | "walk_in"
  | "referral"
  | "broker"
  | "social_media"
  | "advertising"
  | "other";

export type InteractionType = "call" | "meeting" | "message" | "email" | "other";

export interface Client {
  readonly id: string;
  readonly fullName: string;
  readonly phone: string;
  readonly extraPhone: string | null;
  readonly whatsapp: string | null;
  readonly telegram: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly source: ClientSource;
  readonly pipelineStageId: string | null;
  readonly pipelineStageName: string | null;
  readonly managerId: string | null;
  readonly managerName: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
}

export interface Interaction {
  readonly id: string;
  readonly clientId: string;
  readonly type: InteractionType;
  readonly notes: string;
  readonly nextContactDate: string | null;
  readonly createdByName: string;
  readonly createdAt: string;
}

export interface PipelineStage {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly order: number;
  readonly clientsCount: number;
}

export interface PipelineBoard {
  readonly stages: readonly PipelineBoardStage[];
}

export interface PipelineBoardStage {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly order: number;
  readonly clients: readonly Client[];
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateClientInput {
  fullName: string;
  phone: string;
  extraPhone?: string | undefined;
  whatsapp?: string | undefined;
  telegram?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  source: ClientSource;
  pipelineStageId?: string | undefined;
  managerId?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateClientInput {
  fullName?: string | undefined;
  phone?: string | undefined;
  extraPhone?: string | undefined;
  whatsapp?: string | undefined;
  telegram?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  source?: ClientSource | undefined;
  pipelineStageId?: string | undefined;
  managerId?: string | undefined;
  notes?: string | undefined;
}

export interface AddInteractionInput {
  type: InteractionType;
  notes: string;
  nextContactDate?: string | undefined;
}

export interface ClientsListParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: ClientSource;
  managerId?: string;
  pipelineStageId?: string;
}

export interface PipelineBoardParams {
  managerId?: string;
  source?: ClientSource;
}
