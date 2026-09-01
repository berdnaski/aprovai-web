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

export interface ReleaseWithoutInvoicePayload {
  supplierId: string
  amountCents: string
  dueDate: string
  note: string
  file: File
}

export async function releaseWithoutInvoice(
  payload: ReleaseWithoutInvoicePayload,
): Promise<Payable> {
  const form = new FormData()
  form.append("supplierId", payload.supplierId)
  form.append("amountCents", payload.amountCents)
  form.append("dueDate", payload.dueDate)
  form.append("note", payload.note)
  form.append("file", payload.file)

  const { data } = await apiClient.post<Payable>(
    "/payables/release-without-invoice",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return data
}
