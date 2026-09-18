import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  cancelRecurringContract,
  createRecurringContract,
  getRecurringContract,
  linkInvoiceToRecurringContract,
  listRecurringContracts,
  listRecurringOccurrences,
  type CreateRecurringContractPayload,
  type ListRecurringContractsQuery,
} from "@/api/recurring-contracts"

export const recurringContractKeys = {
  all: ["recurring-contracts"] as const,
  list: (query: ListRecurringContractsQuery) =>
    ["recurring-contracts", "list", query] as const,
  detail: (id: string) => ["recurring-contracts", id] as const,
  occurrences: (id: string) => ["recurring-contracts", id, "occurrences"] as const,
}

export function useRecurringContracts(query: ListRecurringContractsQuery = {}) {
  return useQuery({
    queryKey: recurringContractKeys.list(query),
    queryFn: () => listRecurringContracts(query),
    placeholderData: (previous) => previous,
  })
}

export function useRecurringContractByRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: recurringContractKeys.list({ sourceRequestId: requestId }),
    queryFn: () => listRecurringContracts({ sourceRequestId: requestId }),
    enabled: Boolean(requestId),
    select: (contracts) => contracts[0],
  })
}

export function useRecurringContract(id: string | undefined) {
  return useQuery({
    queryKey: recurringContractKeys.detail(id ?? ""),
    queryFn: () => getRecurringContract(id as string),
    enabled: Boolean(id),
  })
}

export function useRecurringOccurrences(contractId: string | undefined) {
  return useQuery({
    queryKey: recurringContractKeys.occurrences(contractId ?? ""),
    queryFn: () => listRecurringOccurrences(contractId as string),
    enabled: Boolean(contractId),
  })
}

function useInvalidateRecurringContracts() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: recurringContractKeys.all })
  }
}

export function useCreateRecurringContract(requestId: string) {
  const invalidate = useInvalidateRecurringContracts()

  return useMutation({
    mutationFn: (payload: CreateRecurringContractPayload) =>
      createRecurringContract(requestId, payload),
    onSuccess: invalidate,
  })
}

export function useCancelRecurringContract() {
  const invalidate = useInvalidateRecurringContracts()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelRecurringContract(id, reason),
    onSuccess: invalidate,
  })
}

export function useLinkInvoiceToRecurringContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      invoiceId,
      contractId,
      overrideNote,
    }: {
      invoiceId: string
      contractId: string
      overrideNote?: string
    }) => linkInvoiceToRecurringContract(invoiceId, contractId, overrideNote),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recurringContractKeys.all })
      void queryClient.invalidateQueries({ queryKey: ["invoices"] })
      void queryClient.invalidateQueries({ queryKey: ["payables"] })
    },
  })
}
