"use client";

import { useQuery } from "@tanstack/react-query";
import { dealKeys } from "@/modules/deals/presentation/query-keys";
import { fetchDealsList } from "@/modules/deals/infrastructure/repository";
import { fetchClientsList } from "@/modules/clients/infrastructure/clients-repository";
import { fetchUnitsList } from "@/modules/properties/infrastructure/properties-repository";
import { fetchPropertiesMinimal } from "@/modules/deals/infrastructure/repository";
import type { Deal, DealsListParams } from "@/modules/deals/domain/deal";

/**
 * Fetches the deals list and enriches each deal with client name/phone,
 * unit number, property name, and manager name from parallel lookup queries.
 *
 * The API only returns IDs for these relations, so we fetch the lookup data
 * separately and join it client-side.
 */
export function useEnrichedDealsListQuery(params?: DealsListParams, enabled = true) {
  return useQuery({
    queryKey: [...dealKeys.list(params), "enriched"] as const,
    queryFn: async (): Promise<Deal[]> => {
      // 1. Fetch deals first
      const deals = await fetchDealsList(params);

      if (deals.length === 0) return deals;

      // 2. Collect unique IDs for lookups
      const clientIds = new Set<string>();
      const unitPropertyIds = new Set<string>();

      for (const deal of deals) {
        if (deal.clientId) clientIds.add(deal.clientId);
        if (deal.unitId) unitPropertyIds.add(deal.unitId);
      }

      // 3. Fetch lookup data in parallel (with generous limits to get all needed entries)
      const [clientsResult, unitsResult, properties] = await Promise.all([
        clientIds.size > 0
          ? fetchClientsList({ limit: 200 }).catch(() => null)
          : Promise.resolve(null),
        unitPropertyIds.size > 0
          ? fetchUnitsList({ limit: 200 }).catch(() => null)
          : Promise.resolve(null),
        fetchPropertiesMinimal().catch(() => []),
      ]);

      // 4. Build lookup maps
      const clientMap = new Map<string, { fullName: string; phone: string }>();
      if (clientsResult) {
        for (const client of clientsResult.items) {
          clientMap.set(client.id, { fullName: client.fullName, phone: client.phone });
        }
      }

      const unitMap = new Map<string, { unitNumber: string; propertyId: string }>();
      if (unitsResult) {
        for (const unit of unitsResult.items) {
          unitMap.set(unit.id, { unitNumber: unit.unitNumber, propertyId: unit.propertyId });
        }
      }

      const propertyMap = new Map<string, string>();
      for (const prop of properties) {
        propertyMap.set(prop.id, prop.name);
      }

      // 5. Enrich deals with looked-up data
      return deals.map((deal): Deal => {
        const client = clientMap.get(deal.clientId);
        const unit = unitMap.get(deal.unitId);
        const propertyId = deal.propertyId || unit?.propertyId || "";
        const propertyName = propertyMap.get(propertyId) || deal.propertyName;

        return {
          ...deal,
          clientName: client?.fullName || deal.clientName,
          clientPhone: client?.phone || deal.clientPhone,
          unitNumber: unit?.unitNumber || deal.unitNumber,
          propertyId: propertyId,
          propertyName: propertyName,
        };
      });
    },
    enabled,
  });
}
