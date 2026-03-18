import type { DealsRepository } from "@/modules/deals/application/ports";
import { createListDealsUseCase } from "@/modules/deals/application/use-cases/list-deals.use-case";
import type { DealsListResponseDto } from "@/modules/deals/infrastructure/dto";
import { mapDealsDtoToDomain } from "@/modules/deals/infrastructure/mappers";
import { httpRequest } from "@/shared/lib/http/http-client";

export class ApiDealsRepository implements DealsRepository {
  async list() {
    const response = await httpRequest<DealsListResponseDto>("/deals", { method: "GET" });
    return response.data.map(mapDealsDtoToDomain);
  }
}

const repository = new ApiDealsRepository();
export const listDeals = createListDealsUseCase(repository);
