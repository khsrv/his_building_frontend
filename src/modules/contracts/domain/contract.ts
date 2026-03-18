// ─── Domain entities ──────────────────────────────────────────────────────────

export interface ContractTemplate {
  readonly id: string;
  readonly name: string;
  readonly templateType: string;
  readonly body: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SmsTemplate {
  readonly id: string;
  readonly name: string;
  readonly eventType: string;
  readonly body: string;
  readonly daysBefore: number | null;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface SmsLog {
  readonly id: string;
  readonly phone: string;
  readonly message: string;
  readonly status: string;
  readonly clientId: string | null;
  readonly clientName: string | null;
  readonly templateId: string | null;
  readonly createdAt: string;
}

export interface GeneratedContract {
  readonly html: string;
  readonly dealNumber: string;
  readonly clientName: string;
}

// ─── Input types (mutable) ────────────────────────────────────────────────────

export interface CreateContractTemplateInput {
  name: string;
  templateType: string;
  body: string;
}

export interface UpdateContractTemplateInput {
  name?: string | undefined;
  body?: string | undefined;
  isActive?: boolean | undefined;
}

export interface CreateSmsTemplateInput {
  name: string;
  eventType: string;
  body: string;
  daysBefore?: number | undefined;
}

export interface SendSmsInput {
  phone: string;
  message: string;
  clientId?: string | undefined;
  templateId?: string | undefined;
}

export interface BulkSendSmsInput {
  phones: string[];
  message: string;
  templateId?: string | undefined;
}

export interface SmsLogListParams {
  status?: string | undefined;
  clientId?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}
