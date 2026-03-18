import type { LandRepository } from "@/modules/land/application/ports";
import { createListLandUseCase } from "@/modules/land/application/use-cases/list-land.use-case";
import type { LandListResponseDto } from "@/modules/land/infrastructure/dto";
import { mapLandDtoToDomain } from "@/modules/land/infrastructure/mappers";
import { httpRequest } from "@/shared/lib/http/http-client";

export class ApiLandRepository implements LandRepository {
  async list() {
    const response = await httpRequest<LandListResponseDto>("/land", { method: "GET" });
    return response.data.map(mapLandDtoToDomain);
  }
}

const repository = new ApiLandRepository();
export const listLand = createListLandUseCase(repository);
