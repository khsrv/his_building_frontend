import type { ClientsListParams, PipelineBoardParams } from "@/modules/clients/domain/client";

export const clientKeys = {
  all: ["clients"] as const,
  lists: () => ["clients", "list"] as const,
  list: (params?: ClientsListParams) => ["clients", "list", params] as const,
  details: () => ["clients", "detail"] as const,
  detail: (id: string) => ["clients", "detail", id] as const,
  interactions: (clientId: string) => ["clients", "interactions", clientId] as const,
  pipelineStages: () => ["clients", "pipeline-stages"] as const,
  pipelineBoard: (params?: PipelineBoardParams) => ["clients", "pipeline-board", params] as const,
};

// Legacy export for backward compat
export const clientsQueryKeys = {
  all: ["clients"] as const,
  list: () => ["clients", "list"] as const,
};
