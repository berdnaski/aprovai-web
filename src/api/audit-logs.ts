import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type { AuditEventType } from "@/types/enums"

export type AuditValue = string | number | boolean | null

export interface AuditLog {
  id: string
  actorId: string | null
  eventType: AuditEventType
  entityType: string
  entityId: string
  oldData: Record<string, AuditValue> | null
  newData: Record<string, AuditValue> | null
  ipAddress: string | null
  occurredAt: string
}

export interface ListAuditLogsQuery {
  actorId?: string
  eventType?: AuditEventType
  entityType?: string
  entityId?: string
  from?: string
  to?: string
  page?: number
  perPage?: number
}

export async function listAuditLogs(
  query: ListAuditLogsQuery = {},
): Promise<Paginated<AuditLog>> {
  const { data } = await apiClient.get<Paginated<AuditLog>>("/audit-logs", {
    params: query,
  })
  return data
}
