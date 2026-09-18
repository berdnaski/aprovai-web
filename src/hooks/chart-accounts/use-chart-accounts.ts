import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  applyModelChart,
  createChartAccount,
  importChartAccounts,
  listChartAccounts,
  setChartAccountActive,
  updateChartAccount,
  type ChartAccountPayload,
  type ChartAccountUpdatePayload,
} from "@/api/chart-accounts"

export const chartAccountKeys = {
  all: ["chart-accounts"] as const,
  list: (includeInactive: boolean) =>
    ["chart-accounts", { includeInactive }] as const,
}

function useInvalidateChartAccounts() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: chartAccountKeys.all })
    void queryClient.invalidateQueries({ queryKey: ["categories"] })
  }
}

export function useChartAccounts(includeInactive = false) {
  return useQuery({
    queryKey: chartAccountKeys.list(includeInactive),
    queryFn: () => listChartAccounts(includeInactive),
    placeholderData: (previous) => previous,
  })
}

export function useCreateChartAccount() {
  const invalidate = useInvalidateChartAccounts()

  return useMutation({
    mutationFn: (payload: ChartAccountPayload) => createChartAccount(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateChartAccount(id: string) {
  const invalidate = useInvalidateChartAccounts()

  return useMutation({
    mutationFn: (payload: ChartAccountUpdatePayload) =>
      updateChartAccount(id, payload),
    onSuccess: invalidate,
  })
}

export function useSetChartAccountActive() {
  const invalidate = useInvalidateChartAccounts()

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setChartAccountActive(id, active),
    onSuccess: invalidate,
  })
}

export function useImportChartAccounts() {
  const invalidate = useInvalidateChartAccounts()

  return useMutation({
    mutationFn: (file: File) => importChartAccounts(file),
    onSuccess: invalidate,
  })
}

export function useApplyModelChart() {
  const invalidate = useInvalidateChartAccounts()

  return useMutation({
    mutationFn: applyModelChart,
    onSuccess: invalidate,
  })
}
