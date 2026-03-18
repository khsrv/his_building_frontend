export const financeQueryKeys = {
  all: ["finance"] as const,
  list: () => ["finance", "list"] as const,
};
