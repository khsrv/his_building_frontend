"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { fetchDealDetail } from "@/modules/deals/infrastructure/repository";
import { fetchClientDetail } from "@/modules/clients/infrastructure/clients-repository";
import { fetchPropertiesMinimal } from "@/modules/deals/infrastructure/repository";
import { fetchUnitsList } from "@/modules/properties/infrastructure/properties-repository";
import type { Deal } from "@/modules/deals/domain/deal";

/**
 * Fetches a single deal and enriches it with client name/phone,
 * unit number, and property name by fetching related entities.
 */
export function useEnrichedDealDetailQuery(id: string) {
  return useQuery({
    queryKey: [...dealKeys.detail(id), "enriched"] as const,
    queryFn: async (): Promise<Deal> => {
      // 1. Fetch the deal
      const deal = await fetchDealDetail(id);

      // 2. Fetch related entities in parallel
      const [client, unitsResult, properties] = await Promise.all([
        deal.clientId
          ? fetchClientDetail(deal.clientId).catch(() => null)
          : Promise.resolve(null),
        deal.unitId
          ? fetchUnitsList({ limit: 200 }).catch(() => null)
          : Promise.resolve(null),
        fetchPropertiesMinimal().catch(() => []),
      ]);

      // 3. Find the matching unit
      const unit = unitsResult?.items.find((u) => u.id === deal.unitId) ?? null;

      // 4. Build property map
      const propertyMap = new Map<string, string>();
      for (const prop of properties) {
        propertyMap.set(prop.id, prop.name);
      }

      const propertyId = deal.propertyId || unit?.propertyId || "";
      const propertyName = propertyMap.get(propertyId) || deal.propertyName;

      return {
        ...deal,
        clientName: client?.fullName || deal.clientName,
        clientPhone: client?.phone || deal.clientPhone,
        unitNumber: unit?.unitNumber || deal.unitNumber,
        propertyId,
        propertyName,
        managerName: client?.managerName || deal.managerName,
      };
    },
    enabled: Boolean(id),
  });
}
