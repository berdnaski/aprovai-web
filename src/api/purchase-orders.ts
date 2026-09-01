import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type { PurchaseOrderStatus } from "@/types/enums"

export interface PurchaseOrderItem {
  id: string
  description: string
  quantity: string
  unit: string
  unitPriceCents: string
  totalCents: string
  receivedQuantity: string
  ncm: string | null
}

export interface PurchaseOrder {
  id: string
  number: string
  purchaseRequestId: string
  supplierId: string
  status: PurchaseOrderStatus
  totalAmountCents: string
  currency: string
  issuedById: string
  issuedAt: string
  expectedDeliveryAt: string | null
  sentToSupplierAt: string | null
  deliveryAddress: string | null
  paymentTerms: string | null
  notes: string | null
  canceledAt: string | null
  cancelReason: string | null
  items?: PurchaseOrderItem[]
}

export interface ItemBalance {
  itemId: string
  description: string
  unit: string
  orderedQuantity: string
  receivedQuantity: string
  pendingQuantity: string
}

export interface ListPurchaseOrdersQuery {
  status?: PurchaseOrderStatus[]
  supplierId?: string
  search?: string
  page?: number
  perPage?: number
}

export async function listPurchaseOrders(
  query: ListPurchaseOrdersQuery = {},
): Promise<Paginated<PurchaseOrder>> {
  const { data } = await apiClient.get<Paginated<PurchaseOrder>>(
    "/purchase-orders",
    { params: query },
  )
  return data
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const { data } = await apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`)
  return data
}

export async function getOrderBalance(id: string): Promise<ItemBalance[]> {
  const { data } = await apiClient.get<ItemBalance[]>(
    `/purchase-orders/${id}/balance`,
  )
  return data
}

export interface IssuePurchaseOrderPayload {
  expectedDeliveryAt?: string
  deliveryAddress?: string
  paymentTerms?: string
  notes?: string
  numberPrefix?: string
}

export async function issuePurchaseOrder(
  requestId: string,
  payload: IssuePurchaseOrderPayload,
): Promise<PurchaseOrder> {
  const { data } = await apiClient.post<PurchaseOrder>(
    `/purchase-requests/${requestId}/purchase-order`,
    payload,
  )
  return data
}

export async function sendPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const { data } = await apiClient.post<PurchaseOrder>(
    `/purchase-orders/${id}/send`,
  )
  return data
}

export async function cancelPurchaseOrder(
  id: string,
  reason: string,
): Promise<PurchaseOrder> {
  const { data } = await apiClient.post<PurchaseOrder>(
    `/purchase-orders/${id}/cancel`,
    { reason },
  )
  return data
}
