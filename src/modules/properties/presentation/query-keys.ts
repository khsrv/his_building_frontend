import type { ChessBoardFilters, PropertiesListParams } from "@/modules/properties/domain/property";

const ALL = ["properties"] as const;

export const propertyKeys = {
  all: ALL,
  lists: () => [...ALL, "list"] as const,
  list: (params: PropertiesListParams) =>
    [...ALL, "list", params as Record<string, unknown>] as const,
  detail: (id: string) => [...ALL, "detail", id] as const,
  blocks: (id: string) => [...ALL, id, "blocks"] as const,
  chessboardPrefix: (id: string) =>
    [...ALL, id, "chessboard"] as const,
  chessboard: (id: string, filters?: ChessBoardFilters) =>
    [...ALL, id, "chessboard", filters ?? {}] as const,
  unitsAll: () => [...ALL, "units"] as const,
  units: (params?: object) => [...ALL, "units", params] as const,
  unit: (id: string) => [...ALL, "units", id] as const,
  floors: (propertyId: string, blockId: string) =>
    [...ALL, propertyId, "blocks", blockId, "floors"] as const,
};
