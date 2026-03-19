import { MutationCache, QueryClient } from "@tanstack/react-query";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";

interface QueryNotifier {
  success: (message: string) => void;
  error: (message: string) => void;
}

export interface MutationNotificationMeta {
  successMessage?: string;
  errorMessage?: string;
  silentSuccess?: boolean;
  silentError?: boolean;
}

interface CreateQueryClientOptions {
  notifier?: QueryNotifier;
}

const DEFAULT_SUCCESS_MESSAGE = "Операция выполнена успешно";
const DEFAULT_ERROR_MESSAGE = "Не удалось выполнить операцию";

function getMutationMeta(meta: unknown): MutationNotificationMeta {
  if (!meta || typeof meta !== "object") {
    return {};
  }
  return meta as MutationNotificationMeta;
}

export function createQueryClient(options?: CreateQueryClientOptions) {
  return new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        const notifier = options?.notifier;
        if (!notifier) {
          return;
        }
        const meta = getMutationMeta(mutation.options.meta);
        if (meta.silentSuccess) {
          return;
        }
        notifier.success(meta.successMessage ?? DEFAULT_SUCCESS_MESSAGE);
      },
      onError: (error, _variables, _context, mutation) => {
        const notifier = options?.notifier;
        if (!notifier) {
          return;
        }
        const meta = getMutationMeta(mutation.options.meta);
        if (meta.silentError) {
          return;
        }
        const normalized = normalizeErrorMessage(error);
        notifier.error(
          meta.errorMessage ??
            (normalized && normalized !== "Unknown error"
              ? normalized
              : DEFAULT_ERROR_MESSAGE),
        );
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
