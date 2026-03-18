export const buildingsQueryKeys = {
  all: ["buildings"] as const,
  list: () => ["buildings", "list"] as const,
};
