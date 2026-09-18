import { apiClient } from "@/api/client"
import type { ChartAccountKind } from "@/types/enums"

export interface ChartAccount {
  id: string
  parentId: string | null
  code: string
  name: string
  kind: ChartAccountKind
  postable: boolean
  externalCode: string | null
  active: boolean
  createdAt: string
}

export interface ChartAccountPayload {
  parentId?: string | null
  code: string
  name: string
  kind?: ChartAccountKind
  postable: boolean
  externalCode?: string | null
}

export interface ChartAccountUpdatePayload {
  name?: string
  externalCode?: string | null
  postable?: boolean
}

export interface ChartImportResult {
  created: number
  updated: number
}

export interface ModelChartResult {
  created: number
  categoriesLinked: number
}

export async function listChartAccounts(
  includeInactive = false,
): Promise<ChartAccount[]> {
  const { data } = await apiClient.get<ChartAccount[]>("/chart-accounts", {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return data
}

export async function createChartAccount(
  payload: ChartAccountPayload,
): Promise<ChartAccount> {
  const { data } = await apiClient.post<ChartAccount>(
    "/chart-accounts",
    payload,
  )
  return data
}

export async function updateChartAccount(
  id: string,
  payload: ChartAccountUpdatePayload,
): Promise<ChartAccount> {
  const { data } = await apiClient.patch<ChartAccount>(
    `/chart-accounts/${id}`,
    payload,
  )
  return data
}

export async function setChartAccountActive(
  id: string,
  active: boolean,
): Promise<ChartAccount> {
  const { data } = await apiClient.patch<ChartAccount>(
    `/chart-accounts/${id}/active`,
    { active },
  )
  return data
}

export async function importChartAccounts(
  file: File,
): Promise<ChartImportResult> {
  const form = new FormData()
  form.append("file", file)

  const { data } = await apiClient.post<ChartImportResult>(
    "/chart-accounts/import",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return data
}

export async function applyModelChart(): Promise<ModelChartResult> {
  const { data } = await apiClient.post<ModelChartResult>(
    "/chart-accounts/model",
  )
  return data
}
