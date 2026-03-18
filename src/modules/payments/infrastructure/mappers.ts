import type { PaymentsItem } from "@/modules/payments/domain/entities";
import type { PaymentsItemDto } from "@/modules/payments/infrastructure/dto";

export function mapPaymentsDtoToDomain(dto: PaymentsItemDto): PaymentsItem {
  return {
    id: dto.id,
    title: dto.title,
    createdAtIso: dto.created_at,
  };
}
