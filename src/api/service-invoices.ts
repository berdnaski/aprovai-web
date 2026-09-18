import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type { InvoiceParseStatus, ServiceInvoiceStatus, WithholdingKind } from "@/types/enums"

export interface ServiceInvoiceWithholding {
  kind: WithholdingKind
  baseCents: string
  rate: string
  amountCents: string
}

export interface ServiceInvoice {
  id: string
  supplierId: string | null
  payableId: string | null
  accessKey: string
  number: string
  verificationCode: string | null
  municipalityCode: string | null
  issuedAt: string
  issuerCnpj: string
  issuerName: string
  recipientCnpj: string
  serviceDescription: string
  serviceCode: string | null
  grossAmountCents: string
  discountCents: string
  issRate: string | null
  issAmountCents: string
  issWithheld: boolean
  netAmountCents: string
  parseStatus: InvoiceParseStatus
  status: ServiceInvoiceStatus
  rejectReason: string | null
  integrityWarnings: string[]
  withholdings?: ServiceInvoiceWithholding[]
}

export interface ListServiceInvoicesQuery {
  status?: ServiceInvoiceStatus[]
  supplierId?: string
  search?: string
  page?: number
  perPage?: number
}

export interface ApproveServiceInvoicePayload {
  supplierId?: string
  dueDate: string
  allocations?: {
    costCenterId: string
    chartAccountId?: string
    shareBps: number
  }[]
}

export async function listServiceInvoices(
  query: ListServiceInvoicesQuery = {},
): Promise<Paginated<ServiceInvoice>> {
  const { data } = await apiClient.get<Paginated<ServiceInvoice>>(
    "/service-invoices",
    { params: query },
  )
  return data
}

export async function getServiceInvoice(id: string): Promise<ServiceInvoice> {
  const { data } = await apiClient.get<ServiceInvoice>(`/service-invoices/${id}`)
  return data
}

export async function uploadServiceInvoice(
  file: File,
  supplierId?: string,
): Promise<ServiceInvoice> {
  const form = new FormData()
  form.append("file", file)
  if (supplierId) {
    form.append("supplierId", supplierId)
  }

  const { data } = await apiClient.post<ServiceInvoice>(
    "/service-invoices/upload",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return data
}

export async function approveServiceInvoice(
  id: string,
  payload: ApproveServiceInvoicePayload,
): Promise<ServiceInvoice> {
  const { data } = await apiClient.post<ServiceInvoice>(
    `/service-invoices/${id}/approve`,
    payload,
  )
  return data
}

export async function rejectServiceInvoice(
  id: string,
  reason: string,
): Promise<ServiceInvoice> {
  const { data } = await apiClient.post<ServiceInvoice>(
    `/service-invoices/${id}/reject`,
    { reason },
  )
  return data
}

export function serviceInvoiceXmlUrl(id: string): string {
  const base = apiClient.defaults.baseURL ?? ""
  return `${base}/service-invoices/${id}/xml`
}
