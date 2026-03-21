import { AppError, type AppErrorCode } from "@/shared/lib/errors/app-error";

const USER_FRIENDLY_MESSAGES: Record<AppErrorCode, string> = {
  UNAUTHORIZED: "Сессия истекла. Пожалуйста, войдите снова.",
  FORBIDDEN: "У вас нет прав для выполнения этой операции.",
  NOT_FOUND: "Запрашиваемый ресурс не найден.",
  VALIDATION: "Проверьте правильность введённых данных.",
  NETWORK: "Нет подключения к интернету. Проверьте сеть и попробуйте снова.",
  SERVER: "Ошибка на сервере. Попробуйте позже или обратитесь к администратору.",
  UNKNOWN: "Произошла непредвиденная ошибка. Попробуйте ещё раз.",
};

export function normalizeErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    // For server errors, always show user-friendly message (backend sends raw "internal server error")
    if (error.code === "SERVER" || error.code === "NETWORK") {
      return USER_FRIENDLY_MESSAGES[error.code];
    }

    // For validation/business errors, prefer the backend message if it's meaningful
    if (error.code === "VALIDATION" && error.message && error.message !== "Validation error") {
      return error.message;
    }

    // For other codes, use backend message if available, otherwise fallback to friendly
    if (error.message && error.message !== "Request failed") {
      return error.message;
    }

    return USER_FRIENDLY_MESSAGES[error.code];
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Произошла непредвиденная ошибка.";
}
