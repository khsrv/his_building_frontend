import type { ChessBoardFilters, PropertiesListParams } from "@/modules/properties/domain/property";

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (params: PropertiesListParams) =>
    [...propertyKeys.lists(), params as Record<string, unknown>] as const,
  detail: (id: string) => [...propertyKeys.all, "detail", id] as const,
  blocks: (id: string) => [...propertyKeys.all, id, "blocks"] as const,
  chessboard: (id: string, filters?: ChessBoardFilters) =>
    [...propertyKeys.all, id, "chessboard", filters ?? {}] as const,
  unitsAll: () => [...propertyKeys.all, "units"] as const,
  units: (params?: object) => [...propertyKeys.all, "units", params] as const,
  unit: (id: string) => [...propertyKeys.all, "units", id] as const,
  floors: (propertyId: string, blockId: string) =>
    [...propertyKeys.all, propertyId, "blocks", blockId, "floors"] as const,
};
