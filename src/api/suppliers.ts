import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type {
  CnpjLookupFailure,
  RegistrationStatus,
  SupplierUsage,
  ValidationStatus,
} from "@/types/enums"

export interface Supplier {
  id: string
  cnpj: string
  legalName: string
  tradeName: string | null
  registrationStatus: RegistrationStatus
  validationStatus: ValidationStatus
  street: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  email: string | null
  phone: string | null
  validatedAt: string | null
  blocked: boolean
  usage: SupplierUsage
  usageReason: string | null
  createdAt: string
}

export interface SupplierLookup {
  cnpj: string
  found: boolean
  failure: CnpjLookupFailure | null
  message: string | null
  alreadyRegistered: boolean
  supplierId: string | null
  legalName: string | null
  tradeName: string | null
  registrationStatus: RegistrationStatus | null
  street: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  email: string | null
  phone: string | null
}

export interface CreateSupplierPayload {
  cnpj: string
  legalName: string
  tradeName?: string | null
  email?: string | null
  phone?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}

export type UpdateSupplierPayload = Omit<CreateSupplierPayload, "cnpj">

export interface SupplierFilters {
  page?: number
  perPage?: number
  search?: string
  registrationStatus?: RegistrationStatus
  validationStatus?: ValidationStatus
  blocked?: boolean
}

export async function listSuppliers(
  filters: SupplierFilters = {},
): Promise<Paginated<Supplier>> {
  const { data } = await apiClient.get<Paginated<Supplier>>("/suppliers", {
    params: filters,
  })
  return data
}

export async function getSupplier(id: string): Promise<Supplier> {
  const { data } = await apiClient.get<Supplier>(`/suppliers/${id}`)
  return data
}

export async function lookupCnpj(cnpj: string): Promise<SupplierLookup> {
  const { data } = await apiClient.get<SupplierLookup>(
    `/suppliers/lookup/${cnpj.replace(/\D/g, "")}`,
  )
  return data
}

export async function createSupplier(
  payload: CreateSupplierPayload,
): Promise<Supplier> {
  const { data } = await apiClient.post<Supplier>("/suppliers", payload)
  return data
}

export async function updateSupplier(
  id: string,
  payload: UpdateSupplierPayload,
): Promise<Supplier> {
  const { data } = await apiClient.patch<Supplier>(`/suppliers/${id}`, payload)
  return data
}

export async function setSupplierBlocked(
  id: string,
  blocked: boolean,
): Promise<Supplier> {
  const { data } = await apiClient.patch<Supplier>(`/suppliers/${id}/blocked`, {
    blocked,
  })
  return data
}

export async function revalidateSupplier(id: string): Promise<Supplier> {
  const { data } = await apiClient.post<Supplier>(`/suppliers/${id}/revalidate`)
  return data
}
