import type { FinanceItem } from "@/modules/finance/domain/entities";
import type { FinanceItemDto } from "@/modules/finance/infrastructure/dto";

export function mapFinanceDtoToDomain(dto: FinanceItemDto): FinanceItem {
  return {
    id: dto.id,
    title: dto.title,
    createdAtIso: dto.created_at,
  };
}
