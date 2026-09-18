import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type {
  BankAccountStatus,
  BankAccountType,
  CnpjLookupFailure,
  PixKeyType,
  RegistrationStatus,
  SupplierUsage,
  TaxRegime,
  TaxRegimeSource,
  ValidationStatus,
} from "@/types/enums"

export interface SupplierPartner {
  name: string
  role: string
  enteredAt: string | null
}

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
  openedOn: string | null
  legalNature: string | null
  companySize: string | null
  shareCapitalCents: string | null
  mainActivityCode: string | null
  mainActivityDescription: string | null
  simplesOpted: boolean | null
  meiOpted: boolean | null
  taxRegime: TaxRegime
  taxRegimeSource: TaxRegimeSource | null
  stateRegistration: string | null
  municipalRegistration: string | null
  partners: SupplierPartner[]
  createdAt: string
}

export interface SupplierBankAccount {
  id: string
  bankCode: string
  branch: string
  accountNumber: string
  accountDigit: string | null
  accountType: BankAccountType
  holderName: string
  holderDocument: string
  pixKeyType: PixKeyType | null
  pixKey: string | null
  thirdParty: boolean
  justification: string | null
  status: BankAccountStatus
  requestedById: string
  requestedAt: string
  reviewedById: string | null
  reviewedAt: string | null
  reviewNote: string | null
}

export interface RequestBankAccountPayload {
  bankCode: string
  branch: string
  accountNumber: string
  accountDigit?: string | null
  accountType: BankAccountType
  holderName: string
  holderDocument: string
  pixKeyType?: PixKeyType
  pixKey?: string | null
  thirdParty?: boolean
  justification?: string | null
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
  taxRegime?: TaxRegime
  municipalRegistration?: string | null
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


export async function listBankAccounts(
  supplierId: string,
): Promise<SupplierBankAccount[]> {
  const { data } = await apiClient.get<SupplierBankAccount[]>(
    `/suppliers/${supplierId}/bank-accounts`,
  )
  return data
}

export async function requestBankAccount(
  supplierId: string,
  payload: RequestBankAccountPayload,
): Promise<SupplierBankAccount> {
  const { data } = await apiClient.post<SupplierBankAccount>(
    `/suppliers/${supplierId}/bank-accounts`,
    payload,
  )
  return data
}

export async function approveBankAccount(
  supplierId: string,
  id: string,
  note?: string,
): Promise<SupplierBankAccount> {
  const { data } = await apiClient.post<SupplierBankAccount>(
    `/suppliers/${supplierId}/bank-accounts/${id}/approve`,
    note ? { note } : {},
  )
  return data
}

export async function rejectBankAccount(
  supplierId: string,
  id: string,
  note: string,
): Promise<SupplierBankAccount> {
  const { data } = await apiClient.post<SupplierBankAccount>(
    `/suppliers/${supplierId}/bank-accounts/${id}/reject`,
    { note },
  )
  return data
}

export async function archiveBankAccount(
  supplierId: string,
  id: string,
): Promise<SupplierBankAccount> {
  const { data } = await apiClient.post<SupplierBankAccount>(
    `/suppliers/${supplierId}/bank-accounts/${id}/archive`,
  )
  return data
}
