import type { DealsItem } from "@/modules/deals/domain/entities";
import type { DealsItemDto } from "@/modules/deals/infrastructure/dto";

export function mapDealsDtoToDomain(dto: DealsItemDto): DealsItem {
  return {
    id: dto.id,
    title: dto.title,
    createdAtIso: dto.created_at,
  };
}
