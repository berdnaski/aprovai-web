import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getInvoice,
  linkInvoice,
  listInvoices,
  listOrderInvoices,
  rejectInvoice,
  uploadInvoice,
  uploadOrderInvoice,
  type ListInvoicesQuery,
} from "@/api/invoices"

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (query: ListInvoicesQuery) => ["invoices", "list", query] as const,
  detail: (id: string) => ["invoices", id] as const,
  byOrder: (orderId: string) => ["invoices", "order", orderId] as const,
}

export function useInvoices(query: ListInvoicesQuery = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(query),
    queryFn: () => listInvoices(query),
    placeholderData: (previous) => previous,
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.detail(id ?? ""),
    queryFn: () => getInvoice(id as string),
    enabled: Boolean(id),
  })
}

export function useOrderInvoices(orderId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.byOrder(orderId ?? ""),
    queryFn: () => listOrderInvoices(orderId as string),
    enabled: Boolean(orderId),
  })
}

function useInvalidateInvoices() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    void queryClient.invalidateQueries({ queryKey: ["match-results"] })
    void queryClient.invalidateQueries({ queryKey: ["payables"] })
  }
}

export function useUploadInvoice(orderId?: string) {
  const invalidate = useInvalidateInvoices()

  return useMutation({
    mutationFn: (file: File) =>
      orderId ? uploadOrderInvoice(orderId, file) : uploadInvoice(file),
    onSuccess: invalidate,
  })
}

export function useLinkInvoice(id: string) {
  const invalidate = useInvalidateInvoices()

  return useMutation({
    mutationFn: (purchaseOrderId: string) => linkInvoice(id, purchaseOrderId),
    onSuccess: invalidate,
  })
}

export function useRejectInvoice(id: string) {
  const invalidate = useInvalidateInvoices()

  return useMutation({
    mutationFn: (reason: string) => rejectInvoice(id, reason),
    onSuccess: invalidate,
  })
}
