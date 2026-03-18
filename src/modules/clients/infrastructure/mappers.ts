import type { ClientsItem } from "@/modules/clients/domain/entities";
import type { ClientsItemDto } from "@/modules/clients/infrastructure/dto";

export function mapClientsDtoToDomain(dto: ClientsItemDto): ClientsItem {
  return {
    id: dto.id,
    title: dto.title,
    createdAtIso: dto.created_at,
  };
}
