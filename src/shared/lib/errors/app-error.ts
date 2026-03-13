export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "NETWORK"
  | "UNKNOWN";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number | undefined;
  public readonly details: unknown | undefined;

  constructor(code: AppErrorCode, message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
