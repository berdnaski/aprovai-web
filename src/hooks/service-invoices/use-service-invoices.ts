import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  approveServiceInvoice,
  getServiceInvoice,
  listServiceInvoices,
  rejectServiceInvoice,
  uploadServiceInvoice,
  type ApproveServiceInvoicePayload,
  type ListServiceInvoicesQuery,
} from "@/api/service-invoices"

export const serviceInvoiceKeys = {
  all: ["service-invoices"] as const,
  list: (query: ListServiceInvoicesQuery) =>
    ["service-invoices", "list", query] as const,
  detail: (id: string) => ["service-invoices", id] as const,
}

export function useServiceInvoices(query: ListServiceInvoicesQuery = {}) {
  return useQuery({
    queryKey: serviceInvoiceKeys.list(query),
    queryFn: () => listServiceInvoices(query),
    placeholderData: (previous) => previous,
  })
}

export function useServiceInvoice(id: string | undefined) {
  return useQuery({
    queryKey: serviceInvoiceKeys.detail(id ?? ""),
    queryFn: () => getServiceInvoice(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateServiceInvoices() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: serviceInvoiceKeys.all })
    void queryClient.invalidateQueries({ queryKey: ["payables"] })
  }
}

export function useUploadServiceInvoice() {
  const invalidate = useInvalidateServiceInvoices()

  return useMutation({
    mutationFn: ({ file, supplierId }: { file: File; supplierId?: string }) =>
      uploadServiceInvoice(file, supplierId),
    onSuccess: invalidate,
  })
}

export function useApproveServiceInvoice(id: string) {
  const invalidate = useInvalidateServiceInvoices()

  return useMutation({
    mutationFn: (payload: ApproveServiceInvoicePayload) =>
      approveServiceInvoice(id, payload),
    onSuccess: invalidate,
  })
}

export function useRejectServiceInvoice(id: string) {
  const invalidate = useInvalidateServiceInvoices()

  return useMutation({
    mutationFn: (reason: string) => rejectServiceInvoice(id, reason),
    onSuccess: invalidate,
  })
}
