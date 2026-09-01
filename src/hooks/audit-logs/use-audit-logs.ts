import { useQuery } from "@tanstack/react-query"

import { listAuditLogs, type ListAuditLogsQuery } from "@/api/audit-logs"

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (query: ListAuditLogsQuery) => ["audit-logs", "list", query] as const,
}

export function useAuditLogs(query: ListAuditLogsQuery = {}) {
  return useQuery({
    queryKey: auditLogKeys.list(query),
    queryFn: () => listAuditLogs(query),
    placeholderData: (previous) => previous,
  })
}
