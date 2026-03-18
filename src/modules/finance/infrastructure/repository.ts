import type { FinanceRepository } from "@/modules/finance/application/ports";
import { createListFinanceUseCase } from "@/modules/finance/application/use-cases/list-finance.use-case";
import type { FinanceListResponseDto } from "@/modules/finance/infrastructure/dto";
import { mapFinanceDtoToDomain } from "@/modules/finance/infrastructure/mappers";
import { httpRequest } from "@/shared/lib/http/http-client";

export class ApiFinanceRepository implements FinanceRepository {
  async list() {
    const response = await httpRequest<FinanceListResponseDto>("/finance", { method: "GET" });
    return response.data.map(mapFinanceDtoToDomain);
  }
}

const repository = new ApiFinanceRepository();
export const listFinance = createListFinanceUseCase(repository);
