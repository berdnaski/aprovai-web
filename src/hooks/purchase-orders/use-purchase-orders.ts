import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  cancelPurchaseOrder,
  getOrderBalance,
  getPurchaseOrder,
  issuePurchaseOrder,
  listPurchaseOrders,
  sendPurchaseOrder,
  type IssuePurchaseOrderPayload,
  type ListPurchaseOrdersQuery,
} from "@/api/purchase-orders"

export const orderKeys = {
  all: ["purchase-orders"] as const,
  list: (query: ListPurchaseOrdersQuery) =>
    ["purchase-orders", "list", query] as const,
  detail: (id: string) => ["purchase-orders", id] as const,
  balance: (id: string) => ["purchase-orders", id, "balance"] as const,
}

export function usePurchaseOrders(query: ListPurchaseOrdersQuery = {}) {
  return useQuery({
    queryKey: orderKeys.list(query),
    queryFn: () => listPurchaseOrders(query),
    placeholderData: (previous) => previous,
  })
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => getPurchaseOrder(id as string),
    enabled: Boolean(id),
  })
}

export function useOrderBalance(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.balance(id ?? ""),
    queryFn: () => getOrderBalance(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateOrders() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: orderKeys.all })
    void queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
  }
}

export function useIssuePurchaseOrder(requestId: string) {
  const invalidate = useInvalidateOrders()

  return useMutation({
    mutationFn: (payload: IssuePurchaseOrderPayload) =>
      issuePurchaseOrder(requestId, payload),
    onSuccess: invalidate,
  })
}

export function useSendPurchaseOrder(id: string) {
  const invalidate = useInvalidateOrders()

  return useMutation({ mutationFn: () => sendPurchaseOrder(id), onSuccess: invalidate })
}

export function useCancelPurchaseOrder(id: string) {
  const invalidate = useInvalidateOrders()

  return useMutation({
    mutationFn: (reason: string) => cancelPurchaseOrder(id, reason),
    onSuccess: invalidate,
  })
}
