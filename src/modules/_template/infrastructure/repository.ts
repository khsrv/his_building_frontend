import type { TemplateRepository } from "@/modules/_template/application/ports";
import { createListTemplateItemsUseCase } from "@/modules/_template/application/use-cases/list-template-items.use-case";
import type { TemplateItemsResponseDto } from "@/modules/_template/infrastructure/dto";
import { mapTemplateItemDtoToDomain } from "@/modules/_template/infrastructure/mappers";
import { httpRequest } from "@/shared/lib/http/http-client";

export class ApiTemplateRepository implements TemplateRepository {
  async list() {
    const response = await httpRequest<TemplateItemsResponseDto>("/template-items", {
      method: "GET",
    });

    return response.data.map(mapTemplateItemDtoToDomain);
  }
}

const repository = new ApiTemplateRepository();
export const listTemplateItems = createListTemplateItemsUseCase(repository);
