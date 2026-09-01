import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type {
  InvoiceParseStatus,
  InvoiceStatus,
  NfeAuthorizationStatus,
  NfeEnvironment,
  TaxKind,
} from "@/types/enums"

export interface InvoiceItem {
  id: string
  sequence: number
  description: string
  ncm: string | null
  cfop: string | null
  quantity: string
  unit: string
  unitPriceCents: string
  totalCents: string
}

export interface InvoiceTax {
  kind: TaxKind
  baseCents: string
  rate: string
  amountCents: string
}

export interface Invoice {
  id: string
  purchaseOrderId: string | null
  supplierId: string | null
  accessKey: string
  number: string
  series: string | null
  issuedAt: string
  issuerCnpj: string
  issuerName: string
  totalAmountCents: string
  parseStatus: InvoiceParseStatus
  status: InvoiceStatus
  rejectReason: string | null
  authorizationStatus: NfeAuthorizationStatus
  protocolNumber: string | null
  protocolReason: string | null
  protocolReceivedAt: string | null
  environment: NfeEnvironment | null
  integrityWarnings: string[]
  items?: InvoiceItem[]
  taxes?: InvoiceTax[]
}

export interface ListInvoicesQuery {
  status?: InvoiceStatus[]
  supplierId?: string
  unlinkedOnly?: boolean
  search?: string
  page?: number
  perPage?: number
}

export async function listInvoices(
  query: ListInvoicesQuery = {},
): Promise<Paginated<Invoice>> {
  const { data } = await apiClient.get<Paginated<Invoice>>("/invoices", {
    params: query,
  })
  return data
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.get<Invoice>(`/invoices/${id}`)
  return data
}

export async function listOrderInvoices(orderId: string): Promise<Invoice[]> {
  const { data } = await apiClient.get<Invoice[]>(
    `/purchase-orders/${orderId}/invoices`,
  )
  return data
}

async function upload(path: string, file: File): Promise<Invoice> {
  const form = new FormData()
  form.append("file", file)

  const { data } = await apiClient.post<Invoice>(path, form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function uploadInvoice(file: File): Promise<Invoice> {
  return upload("/invoices/upload", file)
}

export async function uploadOrderInvoice(
  orderId: string,
  file: File,
): Promise<Invoice> {
  return upload(`/purchase-orders/${orderId}/invoices/upload`, file)
}

export async function linkInvoice(
  id: string,
  purchaseOrderId: string,
): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/link`, {
    purchaseOrderId,
  })
  return data
}

export async function rejectInvoice(
  id: string,
  reason: string,
): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/reject`, {
    reason,
  })
  return data
}

export function invoiceXmlUrl(id: string): string {
  const base = apiClient.defaults.baseURL ?? ""
  return `${base}/invoices/${id}/xml`
}
