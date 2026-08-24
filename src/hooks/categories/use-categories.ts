import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createCategory,
  listCategories,
  setCategoryActive,
  updateCategory,
  type CategoryPayload,
} from "@/api/categories"

export const categoryKeys = {
  all: ["categories"] as const,
  list: (includeInactive: boolean) =>
    ["categories", { includeInactive }] as const,
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: categoryKeys.all })
  }
}

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: categoryKeys.list(includeInactive),
    queryFn: () => listCategories(includeInactive),
    placeholderData: (previous) => previous,
  })
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: invalidate,
  })
}

export function useUpdateCategory(id: string) {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (payload: CategoryPayload) => updateCategory(id, payload),
    onSuccess: invalidate,
  })
}

export function useSetCategoryActive() {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setCategoryActive(id, active),
    onSuccess: invalidate,
  })
}
