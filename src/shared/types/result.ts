import { AppError } from "@/shared/lib/errors/app-error";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };
