import { z } from "zod";

const CLIENT_SOURCES = [
  "website",
  "phone",
  "walk_in",
  "referral",
  "broker",
  "social_media",
  "advertising",
  "other",
] as const;

const INTERACTION_TYPES = [
  "call",
  "meeting",
  "message",
  "email",
  "other",
] as const;

export const createClientSchema = z.object({
  fullName: z.string().min(1, "ФИО обязательно"),
  phone: z.string().min(1, "Телефон обязателен"),
  extraPhone: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  address: z.string().optional(),
  source: z.enum(CLIENT_SOURCES, { required_error: "Источник обязателен" }),
  pipelineStageId: z.string().optional(),
  managerId: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateClientFormValues = z.infer<typeof createClientSchema>;

export const updateClientSchema = z.object({
  fullName: z.string().min(1, "ФИО обязательно").optional(),
  phone: z.string().min(1, "Телефон обязателен").optional(),
  extraPhone: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  address: z.string().optional(),
  source: z.enum(CLIENT_SOURCES).optional(),
  pipelineStageId: z.string().optional(),
  managerId: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateClientFormValues = z.infer<typeof updateClientSchema>;

export const addInteractionSchema = z.object({
  type: z.enum(INTERACTION_TYPES, { required_error: "Тип взаимодействия обязателен" }),
  notes: z.string().min(1, "Заметки обязательны"),
  nextContactDate: z.string().optional(),
});

export type AddInteractionFormValues = z.infer<typeof addInteractionSchema>;
