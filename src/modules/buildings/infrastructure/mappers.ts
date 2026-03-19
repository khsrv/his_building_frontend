import type { BuildingsItem } from "@/modules/buildings/domain/entities";
import type { BuildingsItemDto } from "@/modules/buildings/infrastructure/dto";

export function mapBuildingsDtoToDomain(dto: BuildingsItemDto): BuildingsItem {
  return {
    id: dto.id,
    name: dto.name,
    createdAtIso: dto.created_at ?? "",
  };
}
