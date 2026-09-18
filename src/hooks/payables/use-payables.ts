import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getPayableAllocations,
  listPayables,
  payPayable,
  releasePayable,
  releaseWithoutInvoice,
  replacePayableAllocations,
  type AllocationLinePayload,
  type ListPayablesQuery,
  type ReleaseWithoutInvoicePayload,
} from "@/api/payables"

export const payableKeys = {
  all: ["payables"] as const,
  list: (query: ListPayablesQuery) => ["payables", "list", query] as const,
  allocations: (id: string) => ["payables", id, "allocations"] as const,
}

export function usePayableAllocations(id: string | undefined) {
  return useQuery({
    queryKey: payableKeys.allocations(id ?? ""),
    queryFn: () => getPayableAllocations(id as string),
    enabled: Boolean(id),
  })
}

export function usePayables(query: ListPayablesQuery = {}) {
  return useQuery({
    queryKey: payableKeys.list(query),
    queryFn: () => listPayables(query),
    placeholderData: (previous) => previous,
  })
}

function useInvalidatePayables() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: payableKeys.all })
  }
}

export function usePayPayable() {
  const invalidate = useInvalidatePayables()

  return useMutation({ mutationFn: payPayable, onSuccess: invalidate })
}

export function useReleasePayable() {
  const invalidate = useInvalidatePayables()

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      releasePayable(id, note),
    onSuccess: invalidate,
  })
}

export function useReleaseWithoutInvoice() {
  const invalidate = useInvalidatePayables()

  return useMutation({
    mutationFn: (payload: ReleaseWithoutInvoicePayload) =>
      releaseWithoutInvoice(payload),
    onSuccess: invalidate,
  })
}

export function useReplacePayableAllocations(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lines: AllocationLinePayload[]) =>
      replacePayableAllocations(id, lines),
    onSuccess: (data) => {
      queryClient.setQueryData(payableKeys.allocations(id), data)
    },
  })
}
