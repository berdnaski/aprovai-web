import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type { PayableReleaseReason, PayableStatus } from "@/types/enums"

export interface Payable {
  id: string
  invoiceId: string | null
  supplierId: string
  amountCents: string
  currency: string
  dueDate: string
  status: PayableStatus
  releaseReason: PayableReleaseReason | null
  releaseNote: string | null
  paidAt: string | null
}

export interface ListPayablesQuery {
  status?: PayableStatus[]
  supplierId?: string
  page?: number
  perPage?: number
}

export async function listPayables(
  query: ListPayablesQuery = {},
): Promise<Paginated<Payable>> {
  const { data } = await apiClient.get<Paginated<Payable>>("/payables", {
    params: query,
  })
  return data
}

export async function payPayable(id: string): Promise<Payable> {
  const { data } = await apiClient.post<Payable>(`/payables/${id}/pay`)
  return data
}

export async function releasePayable(
  id: string,
  note?: string,
): Promise<Payable> {
  const { data } = await apiClient.post<Payable>(
    `/payables/${id}/release`,
    note ? { note } : {},
  )
  return data
}

export interface AllocationLine {
  costCenterId: string
  chartAccountId: string | null
  amountCents: string
}

export interface AllocationLinePayload {
  costCenterId: string
  chartAccountId?: string | null
  shareBps: number
}

export interface ReleaseWithoutInvoicePayload {
  supplierId: string
  amountCents: string
  dueDate: string
  note: string
  file: File
  allocations?: AllocationLinePayload[]
}

export async function releaseWithoutInvoice(
  payload: ReleaseWithoutInvoicePayload,
): Promise<Payable> {
  const form = new FormData()
  form.append("supplierId", payload.supplierId)
  form.append("amountCents", payload.amountCents)
  form.append("dueDate", payload.dueDate)
  form.append("note", payload.note)
  form.append("proof", payload.file)

  payload.allocations?.forEach((line, index) => {
    form.append(`allocations[${index}][costCenterId]`, line.costCenterId)
    if (line.chartAccountId) {
      form.append(`allocations[${index}][chartAccountId]`, line.chartAccountId)
    }
    form.append(`allocations[${index}][shareBps]`, String(line.shareBps))
  })

  const { data } = await apiClient.post<Payable>(
    "/payables/release-without-invoice",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return data
}

export async function getPayableAllocations(
  id: string,
): Promise<AllocationLine[]> {
  const { data } = await apiClient.get<AllocationLine[]>(
    `/payables/${id}/allocations`,
  )
  return data
}

export async function replacePayableAllocations(
  id: string,
  lines: AllocationLinePayload[],
): Promise<AllocationLine[]> {
  const { data } = await apiClient.put<AllocationLine[]>(
    `/payables/${id}/allocations`,
    { lines },
  )
  return data
}
