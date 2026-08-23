import { apiClient } from "@/api/client"
import { CostCenterBudgetStatus } from "@/types/enums"

export interface CostCenter {
  id: string
  name: string
  code: string | null
  managerId: string
  parentId: string | null
  createdAt: string
  disabledAt: string | null
}

export interface CostCenterBudgetSummary {
  budgetId: string
  periodStart: string
  periodEnd: string
  totalAmountCents: string
  committedCents: string
  underReviewCents: string
  availableCents: string
  usagePercent: number
}

export interface CostCenterSummary extends CostCenter {
  managerName: string | null
  memberCount: number
  openRequests: number
  budget: CostCenterBudgetSummary | null
}

export interface CostCenterMemberLink {
  id: string
  costCenterId: string
  memberId: string
  createdAt: string
}

export interface CreateCostCenterPayload {
  name: string
  code?: string | null
  managerId: string
  parentId?: string | null
}

export interface UpdateCostCenterPayload {
  name?: string
  code?: string | null
  managerId?: string
  parentId?: string | null
}

export async function listCostCenters(
  includeDisabled = false,
): Promise<CostCenter[]> {
  const { data } = await apiClient.get<CostCenter[]>("/cost-centers", {
    params: includeDisabled ? { includeDisabled: true } : undefined,
  })
  return data
}

export interface CostCenterSummaryFilters {
  includeDisabled?: boolean
  search?: string
  managerId?: string
  budgetStatus?: CostCenterBudgetStatus
}

export async function listCostCentersSummary(
  filters: CostCenterSummaryFilters = {},
): Promise<CostCenterSummary[]> {
  const { data } = await apiClient.get<CostCenterSummary[]>(
    "/cost-centers/summary",
    {
      params: {
        includeDisabled: filters.includeDisabled || undefined,
        search: filters.search?.trim() || undefined,
        managerId: filters.managerId || undefined,
        budgetStatus:
          filters.budgetStatus &&
          filters.budgetStatus !== CostCenterBudgetStatus.ALL
            ? filters.budgetStatus
            : undefined,
      },
    },
  )
  return data
}

export async function getCostCenter(id: string): Promise<CostCenter> {
  const { data } = await apiClient.get<CostCenter>(`/cost-centers/${id}`)
  return data
}

export async function createCostCenter(
  payload: CreateCostCenterPayload,
): Promise<CostCenter> {
  const { data } = await apiClient.post<CostCenter>("/cost-centers", payload)
  return data
}

export async function updateCostCenter(
  id: string,
  payload: UpdateCostCenterPayload,
): Promise<CostCenter> {
  const { data } = await apiClient.patch<CostCenter>(
    `/cost-centers/${id}`,
    payload,
  )
  return data
}

export async function disableCostCenter(id: string): Promise<void> {
  await apiClient.patch(`/cost-centers/${id}/disable`)
}

export async function deleteCostCenter(id: string): Promise<void> {
  await apiClient.delete(`/cost-centers/${id}`)
}

export async function listCostCenterMembers(
  id: string,
): Promise<CostCenterMemberLink[]> {
  const { data } = await apiClient.get<CostCenterMemberLink[]>(
    `/cost-centers/${id}/members`,
  )
  return data
}

export async function linkCostCenterMember(
  id: string,
  memberId: string,
): Promise<CostCenterMemberLink> {
  const { data } = await apiClient.post<CostCenterMemberLink>(
    `/cost-centers/${id}/members`,
    { memberId },
  )
  return data
}

export async function unlinkCostCenterMember(
  id: string,
  memberId: string,
): Promise<void> {
  await apiClient.delete(`/cost-centers/${id}/members/${memberId}`)
}

export async function transferCostCenterManagement(payload: {
  fromMemberId: string
  toMemberId: string
}): Promise<CostCenter[]> {
  const { data } = await apiClient.post<CostCenter[]>(
    "/cost-centers/transfer-management",
    payload,
  )
  return data
}
