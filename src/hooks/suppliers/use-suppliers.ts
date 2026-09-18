import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  approveBankAccount,
  archiveBankAccount,
  createSupplier,
  getSupplier,
  listBankAccounts,
  listSuppliers,
  lookupCnpj,
  rejectBankAccount,
  requestBankAccount,
  revalidateSupplier,
  setSupplierBlocked,
  updateSupplier,
  type RequestBankAccountPayload,
  type SupplierFilters,
  type UpdateSupplierPayload,
} from "@/api/suppliers"

export const supplierKeys = {
  all: ["suppliers"] as const,
  list: (filters: SupplierFilters) => ["suppliers", "list", filters] as const,
  detail: (id: string) => ["suppliers", id] as const,
  bankAccounts: (id: string) => ["suppliers", id, "bank-accounts"] as const,
}

function useInvalidateSuppliers() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: supplierKeys.all })
  }
}

export function useSuppliers(filters: SupplierFilters = {}) {
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: () => listSuppliers(filters),
    placeholderData: (previous) => previous,
  })
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: supplierKeys.detail(id ?? ""),
    queryFn: () => getSupplier(id as string),
    enabled: Boolean(id),
  })
}

export function useLookupCnpj() {
  return useMutation({ mutationFn: lookupCnpj })
}

export function useCreateSupplier() {
  const invalidate = useInvalidateSuppliers()

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: invalidate,
  })
}

export function useUpdateSupplier(id: string) {
  const invalidate = useInvalidateSuppliers()

  return useMutation({
    mutationFn: (payload: UpdateSupplierPayload) => updateSupplier(id, payload),
    onSuccess: invalidate,
  })
}

export function useSetSupplierBlocked() {
  const invalidate = useInvalidateSuppliers()

  return useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      setSupplierBlocked(id, blocked),
    onSuccess: invalidate,
  })
}

export function useRevalidateSupplier() {
  const invalidate = useInvalidateSuppliers()

  return useMutation({
    mutationFn: revalidateSupplier,
    onSuccess: invalidate,
  })
}


export function useBankAccounts(supplierId: string | undefined) {
  return useQuery({
    queryKey: supplierKeys.bankAccounts(supplierId ?? ""),
    queryFn: () => listBankAccounts(supplierId as string),
    enabled: Boolean(supplierId),
  })
}

function useInvalidateBankAccounts(supplierId: string) {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({
      queryKey: supplierKeys.bankAccounts(supplierId),
    })
  }
}

export function useRequestBankAccount(supplierId: string) {
  const invalidate = useInvalidateBankAccounts(supplierId)

  return useMutation({
    mutationFn: (payload: RequestBankAccountPayload) =>
      requestBankAccount(supplierId, payload),
    onSuccess: invalidate,
  })
}

export function useApproveBankAccount(supplierId: string) {
  const invalidate = useInvalidateBankAccounts(supplierId)

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      approveBankAccount(supplierId, id, note),
    onSuccess: invalidate,
  })
}

export function useRejectBankAccount(supplierId: string) {
  const invalidate = useInvalidateBankAccounts(supplierId)

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      rejectBankAccount(supplierId, id, note),
    onSuccess: invalidate,
  })
}

export function useArchiveBankAccount(supplierId: string) {
  const invalidate = useInvalidateBankAccounts(supplierId)

  return useMutation({
    mutationFn: (id: string) => archiveBankAccount(supplierId, id),
    onSuccess: invalidate,
  })
}
