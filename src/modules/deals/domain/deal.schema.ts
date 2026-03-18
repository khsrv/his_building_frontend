import { z } from "zod";

const DEAL_PAYMENT_TYPES = [
  "full_payment",
  "installment",
  "mortgage",
  "barter",
  "combined",
] as const;

const INSTALLMENT_FREQUENCIES = ["monthly", "quarterly", "custom"] as const;

const CURRENCIES = ["USD", "TJS", "RUB", "EUR"] as const;

export const createDealSchema = z
  .object({
    clientId: z.string().min(1, "Выберите клиента"),
    unitId: z.string().min(1, "Выберите квартиру"),
    paymentType: z.enum(DEAL_PAYMENT_TYPES, {
      required_error: "Выберите тип оплаты",
    }),
    totalAmount: z.number({ required_error: "Введите сумму" }).positive("Сумма должна быть больше 0"),
    currency: z.enum(CURRENCIES).default("USD"),
    discountAmount: z.number().min(0).optional(),
    discountReason: z.string().optional(),
    downPayment: z.number().min(0).optional(),
    installmentMonths: z.number().int().positive().optional(),
    installmentFrequency: z.enum(INSTALLMENT_FREQUENCIES).optional(),
    mortgageBank: z.string().optional(),
    mortgageRate: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentType === "installment") {
      if (!data.installmentMonths || data.installmentMonths <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите срок рассрочки (месяцев)",
          path: ["installmentMonths"],
        });
      }
      if (!data.installmentFrequency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Выберите периодичность платежей",
          path: ["installmentFrequency"],
        });
      }
    }
    if (data.paymentType === "mortgage") {
      if (!data.mortgageBank || data.mortgageBank.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите банк",
          path: ["mortgageBank"],
        });
      }
    }
  });

export type CreateDealFormValues = z.infer<typeof createDealSchema>;
