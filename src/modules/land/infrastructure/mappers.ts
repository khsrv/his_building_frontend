import type { LandItem } from "@/modules/land/domain/entities";
import type { LandItemDto } from "@/modules/land/infrastructure/dto";

export function mapLandDtoToDomain(dto: LandItemDto): LandItem {
  return {
    id: dto.id,
    title: dto.title,
    createdAtIso: dto.created_at,
  };
}
