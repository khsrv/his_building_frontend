import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { fetchUnit } from "@/modules/properties/infrastructure/properties-repository";

export function useUnitDetailQuery(unitId: string) {
  return useQuery({
    queryKey: propertyKeys.unit(unitId),
    queryFn: () => fetchUnit(unitId),
    enabled: Boolean(unitId),
  });
}
