import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseData, isApiRecord } from "@/shared/lib/http/api-response";
import type { AuditLog, AuditLogListResult, AuditLogListParams } from "@/modules/audit/domain/audit";

// ─── DTO ──────────────────────────────────────────────────────────────────────

interface AuditEventDto {
  id: string;
  event_type: string;
  actor_user_id?: string | null;
  target_user_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

interface AuditListDto {
  items: AuditEventDto[];
  total: number;
  page: number;
  limit: number;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapAuditEvent(dto: AuditEventDto): AuditLog {
  return {
    id: dto.id,
    eventType: dto.event_type,
    actorUserId: dto.actor_user_id ?? null,
    targetUserId: dto.target_user_id ?? null,
    entityType: dto.entity_type ?? null,
    entityId: dto.entity_id ?? null,
    oldValue: dto.old_value ?? null,
    newValue: dto.new_value ?? null,
    metadata: dto.metadata ?? null,
    createdAt: dto.created_at,
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export async function listAuditLogs(params?: AuditLogListParams): Promise<AuditLogListResult> {
  const query = new URLSearchParams();
  if (params?.eventType) query.set("event_type", params.eventType);
  if (params?.entityType) query.set("entity_type", params.entityType);
  if (params?.entityId) query.set("entity_id", params.entityId);
  if (params?.actorId) query.set("actor_id", params.actorId);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  const url = qs ? `/admin/audit-logs?${qs}` : "/admin/audit-logs";

  const response = await apiClient.get(url);
  const data = getResponseData(response);

  if (!isApiRecord(data)) {
    return { items: [], total: 0, page: 1, limit: 50 };
  }

  const dto = data as unknown as AuditListDto;
  return {
    items: (dto.items ?? []).map(mapAuditEvent),
    total: dto.total ?? 0,
    page: dto.page ?? 1,
    limit: dto.limit ?? 50,
  };
}
