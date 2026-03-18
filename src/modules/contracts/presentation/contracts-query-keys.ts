export const contractsQueryKeys = {
  all: ["contracts"] as const,
  templates: () => [...contractsQueryKeys.all, "templates"] as const,
  template: (id: string) => [...contractsQueryKeys.templates(), id] as const,
  smsTemplates: () => [...contractsQueryKeys.all, "sms-templates"] as const,
  smsLogs: (params?: object) => [...contractsQueryKeys.all, "sms-logs", params] as const,
} as const;
