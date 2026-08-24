import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createSupplier,
  getSupplier,
  listSuppliers,
  lookupCnpj,
  revalidateSupplier,
  setSupplierBlocked,
  updateSupplier,
  type SupplierFilters,
  type UpdateSupplierPayload,
} from "@/api/suppliers"

export const supplierKeys = {
  all: ["suppliers"] as const,
  list: (filters: SupplierFilters) => ["suppliers", "list", filters] as const,
  detail: (id: string) => ["suppliers", id] as const,
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
