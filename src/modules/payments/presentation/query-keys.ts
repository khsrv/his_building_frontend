export const paymentsQueryKeys = {
  all: ["payments"] as const,
  list: () => ["payments", "list"] as const,
};
