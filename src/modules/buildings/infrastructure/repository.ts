import { apiClient } from "@/shared/lib/http/api-client";
import type { BuildingsRepository } from "@/modules/buildings/application/ports";
import { createListBuildingsUseCase } from "@/modules/buildings/application/use-cases/list-buildings.use-case";
import type { BuildingsItemDto } from "@/modules/buildings/infrastructure/dto";
import { mapBuildingsDtoToDomain } from "@/modules/buildings/infrastructure/mappers";

export class ApiBuildingsRepository implements BuildingsRepository {
  async list() {
    type Res = { data: { items: BuildingsItemDto[] } | BuildingsItemDto[] };
    const response = await apiClient.get<Res>("/api/v1/properties", { limit: 100 });
    const payload = response.data;
    const items = Array.isArray(payload)
      ? payload
      : (payload as { items: BuildingsItemDto[] }).items ?? [];
    return items.filter((item): item is BuildingsItemDto => Boolean(item?.id)).map(mapBuildingsDtoToDomain);
  }
}

const repository = new ApiBuildingsRepository();
export const listBuildings = createListBuildingsUseCase(repository);
