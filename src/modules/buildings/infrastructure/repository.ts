import type { BuildingsRepository } from "@/modules/buildings/application/ports";
import { createListBuildingsUseCase } from "@/modules/buildings/application/use-cases/list-buildings.use-case";
import type { BuildingsListResponseDto } from "@/modules/buildings/infrastructure/dto";
import { mapBuildingsDtoToDomain } from "@/modules/buildings/infrastructure/mappers";
import { httpRequest } from "@/shared/lib/http/http-client";

export class ApiBuildingsRepository implements BuildingsRepository {
  async list() {
    const response = await httpRequest<BuildingsListResponseDto>("/buildings", { method: "GET" });
    return response.data.map(mapBuildingsDtoToDomain);
  }
}

const repository = new ApiBuildingsRepository();
export const listBuildings = createListBuildingsUseCase(repository);
