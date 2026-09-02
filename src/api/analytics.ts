import { apiClient } from "@/api/client"
import type { RequestStatus } from "@/types/enums"

export interface StatusTotal {
  status: RequestStatus
  total: number
  amountCents: string
}

export interface CostCenterConsumption {
  costCenterId: string
  costCenterName: string
  budgetCents: string
  committedCents: string
  availableCents: string
  usagePercent: number
}

export interface ApproverPerformance {
  memberId: string
  approverName: string
  decisions: number
  averageHours: number
}

export interface CostCenterCycleTime {
  costCenterId: string
  costCenterName: string
  finalized: number
  averageHours: number
}

export interface Bottleneck {
  memberId: string
  approverName: string
  waiting: number
  oldestSince: string | null
  amountCents: string
}

export interface RepeatedRequest {
  requesterName: string
  supplierName: string
  amountCents: string
  occurrences: number
  lastAt: string
}

export interface DailyVolume {
  day: string
  created: number
  finalized: number
  approvedCents: string
}

export interface Dashboard {
  from: string
  to: string
  totals: StatusTotal[]
  consumption: CostCenterConsumption[]
  approvers: ApproverPerformance[]
  costCenters: CostCenterCycleTime[]
  bottlenecks: Bottleneck[]
  repeated: RepeatedRequest[]
  daily: DailyVolume[]
}

export interface DashboardQuery {
  from?: string
  to?: string
}

export async function getDashboard(
  query: DashboardQuery = {},
): Promise<Dashboard> {
  const { data } = await apiClient.get<Dashboard>("/analytics/dashboard", {
    params: query,
  })
  return data
}

export type ExportFormat = "csv" | "xlsx"

export async function exportRequests(
  format: ExportFormat,
  query: DashboardQuery = {},
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>("/analytics/exports/requests", {
    params: { format, ...query },
    responseType: "blob",
  })
  return data
}
