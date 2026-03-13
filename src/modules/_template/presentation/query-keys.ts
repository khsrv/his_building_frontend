export const templateQueryKeys = {
  all: ["template"] as const,
  list: () => [...templateQueryKeys.all, "list"] as const,
};
