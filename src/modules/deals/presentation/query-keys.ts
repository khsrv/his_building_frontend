export const dealsQueryKeys = {
  all: ["deals"] as const,
  list: () => ["deals", "list"] as const,
};
