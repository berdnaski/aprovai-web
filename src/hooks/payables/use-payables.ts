import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  listPayables,
  payPayable,
  releaseWithoutInvoice,
  type ListPayablesQuery,
  type ReleaseWithoutInvoicePayload,
} from "@/api/payables"

export const payableKeys = {
  all: ["payables"] as const,
  list: (query: ListPayablesQuery) => ["payables", "list", query] as const,
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

export function useReleaseWithoutInvoice() {
  const invalidate = useInvalidatePayables()

  return useMutation({
    mutationFn: (payload: ReleaseWithoutInvoicePayload) =>
      releaseWithoutInvoice(payload),
    onSuccess: invalidate,
  })
}
