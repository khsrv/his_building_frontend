import { apiClient } from "@/shared/lib/http/api-client";
import { getResponseItems, normalizeApiKeys } from "@/shared/lib/http/api-response";
import type { BuildingsRepository } from "@/modules/buildings/application/ports";
import { createListBuildingsUseCase } from "@/modules/buildings/application/use-cases/list-buildings.use-case";
import type { BuildingsItemDto } from "@/modules/buildings/infrastructure/dto";
import { mapBuildingsDtoToDomain } from "@/modules/buildings/infrastructure/mappers";

export class ApiBuildingsRepository implements BuildingsRepository {
  async list() {
    const response = await apiClient.get<unknown>("/api/v1/properties", { limit: 100 });
    const items = getResponseItems<BuildingsItemDto>(normalizeApiKeys(response));
    return items.filter((item): item is BuildingsItemDto => Boolean(item?.id)).map(mapBuildingsDtoToDomain);
  }
}

const repository = new ApiBuildingsRepository();
export const listBuildings = createListBuildingsUseCase(repository);
