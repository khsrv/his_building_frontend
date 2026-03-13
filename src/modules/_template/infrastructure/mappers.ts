import type { TemplateItem } from "@/modules/_template/domain/entities";
import type { TemplateItemDto } from "@/modules/_template/infrastructure/dto";

export function mapTemplateItemDtoToDomain(dto: TemplateItemDto): TemplateItem {
  return {
    id: dto.id,
    title: dto.title,
    createdAtIso: dto.created_at,
  };
}
