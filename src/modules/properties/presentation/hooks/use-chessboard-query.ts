"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { fetchChessBoard } from "@/modules/properties/infrastructure/properties-repository";
import type { ChessBoardFilters } from "@/modules/properties/domain/property";

export function useChessBoardQuery(propertyId: string, filters?: ChessBoardFilters) {
  return useQuery({
    queryKey: propertyKeys.chessboard(propertyId, filters),
    queryFn: () => fetchChessBoard(propertyId, filters),
    enabled: Boolean(propertyId),
  });
}
