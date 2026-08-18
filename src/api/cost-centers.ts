import { apiClient } from "@/api/client"

export interface CostCenter {
  id: string
  companyId: string
  name: string
  code: string | null
  managerId: string
  parentId: string | null
  disabledAt: string | null
  createdAt: string
}

export interface CreateCostCenterPayload {
  name: string
  code?: string | null
  managerId: string
  parentId?: string | null
}

export async function listCostCenters(): Promise<CostCenter[]> {
  const { data } = await apiClient.get<CostCenter[]>("/cost-centers")
  return data
}

export async function createCostCenter(
  payload: CreateCostCenterPayload,
): Promise<CostCenter> {
  const { data } = await apiClient.post<CostCenter>("/cost-centers", payload)
  return data
}
