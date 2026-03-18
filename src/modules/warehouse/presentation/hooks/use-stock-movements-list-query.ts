"use client";

import { useQuery } from "@tanstack/react-query";
import { warehouseKeys } from "@/modules/warehouse/presentation/query-keys";
import { fetchStockMovementsList } from "@/modules/warehouse/infrastructure/warehouse-repository";
import type { StockMovementsListParams } from "@/modules/warehouse/domain/warehouse";

export function useStockMovementsListQuery(params?: StockMovementsListParams) {
  return useQuery({
    queryKey: warehouseKeys.stockMovementsList(params),
    queryFn: () => fetchStockMovementsList(params),
  });
}
