import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getReceipt,
  listOrderReceipts,
  registerReceipt,
  type RegisterReceiptPayload,
} from "@/api/receipts"

export const receiptKeys = {
  all: ["receipts"] as const,
  byOrder: (orderId: string) => ["receipts", "order", orderId] as const,
  detail: (id: string) => ["receipts", id] as const,
}

export function useOrderReceipts(orderId: string | undefined) {
  return useQuery({
    queryKey: receiptKeys.byOrder(orderId ?? ""),
    queryFn: () => listOrderReceipts(orderId as string),
    enabled: Boolean(orderId),
  })
}

export function useReceipt(id: string | undefined) {
  return useQuery({
    queryKey: receiptKeys.detail(id ?? ""),
    queryFn: () => getReceipt(id as string),
    enabled: Boolean(id),
  })
}

export function useRegisterReceipt(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterReceiptPayload) =>
      registerReceipt(orderId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: receiptKeys.all })
      void queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
    },
  })
}
