import type { MastersListParams, WorkOrdersListParams } from "@/modules/masters/domain/master";

export const mastersKeys = {
  all: ["masters"] as const,

  masters: () => ["masters", "list"] as const,
  mastersList: (params?: MastersListParams) =>
    ["masters", "list", params] as const,

  workOrders: () => ["masters", "work-orders"] as const,
  workOrdersList: (params?: WorkOrdersListParams) =>
    ["masters", "work-orders", "list", params] as const,
};
