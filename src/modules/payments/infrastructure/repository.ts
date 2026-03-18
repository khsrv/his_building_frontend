import type { PaymentsRepository } from "@/modules/payments/application/ports";
import { createListPaymentsUseCase } from "@/modules/payments/application/use-cases/list-payments.use-case";
import type { PaymentsListResponseDto } from "@/modules/payments/infrastructure/dto";
import { mapPaymentsDtoToDomain } from "@/modules/payments/infrastructure/mappers";
import { httpRequest } from "@/shared/lib/http/http-client";

export class ApiPaymentsRepository implements PaymentsRepository {
  async list() {
    const response = await httpRequest<PaymentsListResponseDto>("/payments", { method: "GET" });
    return response.data.map(mapPaymentsDtoToDomain);
  }
}

const repository = new ApiPaymentsRepository();
export const listPayments = createListPaymentsUseCase(repository);
