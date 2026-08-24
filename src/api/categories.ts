import { apiClient } from "@/api/client"

export interface Category {
  id: string
  name: string
  description: string | null
  active: boolean
  createdAt: string
}

export interface CategoryPayload {
  name: string
  description?: string | null
}

export async function listCategories(
  includeInactive = false,
): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories", {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return data
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/categories/${id}`)
  return data
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories", payload)
  return data
}

export async function updateCategory(
  id: string,
  payload: CategoryPayload,
): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload)
  return data
}

export async function setCategoryActive(
  id: string,
  active: boolean,
): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}/active`, {
    active,
  })
  return data
}
