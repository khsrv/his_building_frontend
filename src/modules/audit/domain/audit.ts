// Audit Log domain types.
// Pure TypeScript — no React, no framework imports.

export interface AuditLog {
  readonly id: string;
  readonly eventType: string;
  readonly actorUserId: string | null;
  readonly targetUserId: string | null;
  readonly entityType: string | null;
  readonly entityId: string | null;
  readonly oldValue: Record<string, unknown> | null;
  readonly newValue: Record<string, unknown> | null;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: string;
}

export interface AuditLogListResult {
  readonly items: readonly AuditLog[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface AuditLogListParams {
  readonly eventType?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly actorId?: string;
  readonly from?: string; // ISO 8601
  readonly to?: string;   // ISO 8601
  readonly page?: number;
  readonly limit?: number;
}
