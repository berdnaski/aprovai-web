import { apiClient } from "@/api/client"
import type { BudgetEntryType, BudgetPeriodType } from "@/types/enums"

export interface Budget {
  id: string
  costCenterId: string
  periodStart: string
  periodEnd: string
  totalAmountCents: string
  changeReason: string | null
  updatedById: string | null
  createdAt: string
  updatedAt: string
}

export interface BudgetConsumption {
  budgetId: string
  costCenterId: string
  periodStart: string
  periodEnd: string
  totalAmountCents: string
  committedCents: string
  underReviewCents: string
  availableCents: string
  usagePercent: number
}

export interface BudgetEntry {
  id: string
  budgetId: string
  purchaseRequestId: string
  type: BudgetEntryType
  amountCents: string
  description: string | null
  recordedById: string | null
  occurredAt: string
}

export interface CreateBudgetPayload {
  period: string
  periodType?: BudgetPeriodType
  totalAmountCents: string
}

export interface UpdateBudgetPayload {
  totalAmountCents: string
  changeReason?: string
}

export async function listCostCenterBudgets(
  costCenterId: string,
): Promise<Budget[]> {
  const { data } = await apiClient.get<Budget[]>(
    `/cost-centers/${costCenterId}/budgets`,
  )
  return data
}

export async function getCurrentBudget(
  costCenterId: string,
): Promise<BudgetConsumption> {
  const { data } = await apiClient.get<BudgetConsumption>(
    `/cost-centers/${costCenterId}/budgets/current`,
  )
  return data
}

export async function createBudget(
  costCenterId: string,
  payload: CreateBudgetPayload,
): Promise<Budget> {
  const { data } = await apiClient.post<Budget>(
    `/cost-centers/${costCenterId}/budgets`,
    payload,
  )
  return data
}

export async function updateBudget(
  id: string,
  payload: UpdateBudgetPayload,
): Promise<Budget> {
  const { data } = await apiClient.patch<Budget>(`/budgets/${id}`, payload)
  return data
}

export interface BudgetEntriesFilters {
  type?: BudgetEntryType
  search?: string
}

export async function getBudget(id: string): Promise<Budget> {
  const { data } = await apiClient.get<Budget>(`/budgets/${id}`)
  return data
}

export async function listBudgetEntries(
  id: string,
  filters: BudgetEntriesFilters = {},
): Promise<BudgetEntry[]> {
  const { data } = await apiClient.get<BudgetEntry[]>(`/budgets/${id}/entries`, {
    params: {
      type: filters.type,
      search: filters.search?.trim() || undefined,
    },
  })
  return data
}

export async function downloadBudgetEntriesCsv(id: string): Promise<void> {
  const { data, headers } = await apiClient.get<Blob>(
    `/budgets/${id}/entries/export`,
    { responseType: "blob" },
  )

  const disposition = String(headers["content-disposition"] ?? "")
  const match = /filename="?([^";]+)"?/.exec(disposition)
  const filename = match?.[1] ?? "extrato-orcamento.csv"

  const url = URL.createObjectURL(data)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
