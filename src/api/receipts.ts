import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type { ReceiptStatus } from "@/types/enums"

export interface ReceiptItem {
  id: string
  purchaseOrderItemId: string
  quantity: string
  rejectedQuantity: string
  rejectionReason: string | null
}

export interface Receipt {
  id: string
  number: string
  purchaseOrderId: string
  receivedById: string
  receivedAt: string
  status: ReceiptStatus
  hasDivergence: boolean
  notes: string | null
  items?: ReceiptItem[]
  purchaseOrderNumber?: string
  receivedByName?: string
}

export interface ListReceiptsQuery {
  purchaseOrderId?: string
  divergentOnly?: boolean
  search?: string
  page?: number
  perPage?: number
}

export interface RegisterReceiptItem {
  purchaseOrderItemId: string
  quantity: string
  rejectedQuantity?: string
  rejectionReason?: string
}

export interface RegisterReceiptPayload {
  items: RegisterReceiptItem[]
  receivedAt?: string
  notes?: string
}

export async function listOrderReceipts(
  orderId: string,
): Promise<Receipt[]> {
  const { data } = await apiClient.get<Receipt[]>(
    `/purchase-orders/${orderId}/receipts`,
  )
  return data
}

export async function registerReceipt(
  orderId: string,
  payload: RegisterReceiptPayload,
): Promise<Receipt> {
  const { data } = await apiClient.post<Receipt>(
    `/purchase-orders/${orderId}/receipts`,
    payload,
  )
  return data
}

export async function getReceipt(id: string): Promise<Receipt> {
  const { data } = await apiClient.get<Receipt>(`/receipts/${id}`)
  return data
}

export async function listReceipts(
  query: ListReceiptsQuery = {},
): Promise<Paginated<Receipt>> {
  const { data } = await apiClient.get<Paginated<Receipt>>("/receipts", {
    params: query,
  })
  return data
}
