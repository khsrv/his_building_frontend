import { z } from "zod";

export const passwordSignInSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль минимум 8 символов"),
});

export type PasswordSignInInput = z.infer<typeof passwordSignInSchema>;
