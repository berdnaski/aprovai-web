import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getBudget,
  getBudgetDocumentDownloadUrl,
  createBudget,
  downloadBudgetEntriesCsv,
  listBudgetDocuments,
  listBudgetEntries,
  listCostCenterBudgets,
  updateBudget,
  uploadBudgetDocument,
  type BudgetEntriesFilters,
  type CreateBudgetPayload,
  type UpdateBudgetPayload,
} from "@/api/budgets"

export const budgetKeys = {
  all: ["budgets"] as const,
  byCostCenter: (costCenterId: string) =>
    ["budgets", "cost-center", costCenterId] as const,
  detail: (budgetId: string) => ["budgets", budgetId] as const,
  entries: (budgetId: string, filters?: BudgetEntriesFilters) =>
    ["budgets", budgetId, "entries", filters ?? {}] as const,
  documents: (budgetId: string) => ["budgets", budgetId, "documents"] as const,
}

export function useBudgetDocuments(budgetId: string | undefined) {
  return useQuery({
    queryKey: budgetKeys.documents(budgetId ?? ""),
    queryFn: () => listBudgetDocuments(budgetId as string),
    enabled: Boolean(budgetId),
  })
}

export function useUploadBudgetDocument(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, description }: { file: File; description?: string }) =>
      uploadBudgetDocument(budgetId, file, description),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: budgetKeys.documents(budgetId),
      })
    },
  })
}

export function useBudgetDocumentDownloadUrl(budgetId: string) {
  return useMutation({
    mutationFn: (documentId: string) =>
      getBudgetDocumentDownloadUrl(budgetId, documentId),
  })
}

export function useCostCenterBudgets(costCenterId: string | undefined) {
  return useQuery({
    queryKey: budgetKeys.byCostCenter(costCenterId ?? ""),
    queryFn: () => listCostCenterBudgets(costCenterId as string),
    enabled: Boolean(costCenterId),
  })
}

export function useBudget(budgetId: string | undefined) {
  return useQuery({
    queryKey: budgetKeys.detail(budgetId ?? ""),
    queryFn: () => getBudget(budgetId!),
    enabled: Boolean(budgetId),
  })
}

export function useBudgetEntries(
  budgetId: string | undefined,
  filters: BudgetEntriesFilters = {},
) {
  return useQuery({
    queryKey: budgetKeys.entries(budgetId ?? "", filters),
    queryFn: () => listBudgetEntries(budgetId as string, filters),
    enabled: Boolean(budgetId),
    placeholderData: (previous) => previous,
  })
}

function useInvalidateBudgets() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
    void queryClient.invalidateQueries({ queryKey: ["cost-centers"] })
  }
}

export function useCreateBudget(costCenterId: string) {
  const invalidate = useInvalidateBudgets()

  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) =>
      createBudget(costCenterId, payload),
    onSuccess: invalidate,
  })
}

export function useUpdateBudget(budgetId: string) {
  const invalidate = useInvalidateBudgets()

  return useMutation({
    mutationFn: (payload: UpdateBudgetPayload) =>
      updateBudget(budgetId, payload),
    onSuccess: invalidate,
  })
}

export function useExportBudgetEntries() {
  return useMutation({ mutationFn: downloadBudgetEntriesCsv })
}
