import type { BuildingsItem } from "@/modules/buildings/domain/entities";
import type { BuildingsItemDto } from "@/modules/buildings/infrastructure/dto";

export function mapBuildingsDtoToDomain(dto: BuildingsItemDto): BuildingsItem {
  return {
    id: dto.id,
    title: dto.title,
    createdAtIso: dto.created_at,
  };
}
