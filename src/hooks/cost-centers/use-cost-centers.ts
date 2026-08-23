import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createCostCenter,
  deleteCostCenter,
  disableCostCenter,
  getCostCenter,
  linkCostCenterMember,
  listCostCenterMembers,
  listCostCentersSummary,
  unlinkCostCenterMember,
  updateCostCenter,
  type CostCenterSummaryFilters,
  type UpdateCostCenterPayload,
} from "@/api/cost-centers"
import { listMembers } from "@/api/members"

export const costCenterKeys = {
  all: ["cost-centers"] as const,
  summary: (filters: CostCenterSummaryFilters) =>
    ["cost-centers", "summary", filters] as const,
  detail: (id: string) => ["cost-centers", id] as const,
  members: (id: string) => ["cost-centers", id, "members"] as const,
  companyMembers: ["members"] as const,
}

export function useCostCentersSummary(filters: CostCenterSummaryFilters = {}) {
  return useQuery({
    queryKey: costCenterKeys.summary(filters),
    queryFn: () => listCostCentersSummary(filters),
    placeholderData: (previous) => previous,
  })
}

export function useCostCenter(id: string | undefined) {
  return useQuery({
    queryKey: costCenterKeys.detail(id ?? ""),
    queryFn: () => getCostCenter(id as string),
    enabled: Boolean(id),
  })
}

export function useCostCenterMembers(id: string | undefined) {
  return useQuery({
    queryKey: costCenterKeys.members(id ?? ""),
    queryFn: () => listCostCenterMembers(id as string),
    enabled: Boolean(id),
  })
}

export function useCompanyMembers() {
  return useQuery({
    queryKey: costCenterKeys.companyMembers,
    queryFn: listMembers,
  })
}

function useInvalidateCostCenters() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: costCenterKeys.all })
  }
}

export function useCreateCostCenter() {
  const invalidate = useInvalidateCostCenters()

  return useMutation({
    mutationFn: createCostCenter,
    onSuccess: invalidate,
  })
}

export function useUpdateCostCenter(id: string) {
  const invalidate = useInvalidateCostCenters()

  return useMutation({
    mutationFn: (payload: UpdateCostCenterPayload) =>
      updateCostCenter(id, payload),
    onSuccess: invalidate,
  })
}

export function useReassignCostCenterManager() {
  const invalidate = useInvalidateCostCenters()

  return useMutation({
    mutationFn: ({
      costCenterId,
      managerId,
    }: {
      costCenterId: string
      managerId: string
    }) => updateCostCenter(costCenterId, { managerId }),
    onSuccess: invalidate,
  })
}

export function useDisableCostCenter() {
  const invalidate = useInvalidateCostCenters()

  return useMutation({
    mutationFn: disableCostCenter,
    onSuccess: invalidate,
  })
}

export function useDeleteCostCenter() {
  const invalidate = useInvalidateCostCenters()

  return useMutation({
    mutationFn: deleteCostCenter,
    onSuccess: invalidate,
  })
}

export function useLinkCostCenterMembers(costCenterId: string) {
  const invalidate = useInvalidateCostCenters()

  return useMutation({
    mutationFn: async (memberIds: string[]) => {
      for (const memberId of memberIds) {
        await linkCostCenterMember(costCenterId, memberId)
      }
    },
    onSuccess: invalidate,
  })
}

export function useUnlinkCostCenterMember(costCenterId: string) {
  const invalidate = useInvalidateCostCenters()

  return useMutation({
    mutationFn: (memberId: string) =>
      unlinkCostCenterMember(costCenterId, memberId),
    onSuccess: invalidate,
  })
}
