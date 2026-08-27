import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteApprovalMatrix,
  listApprovalRules,
  replaceApprovalMatrix,
  simulateRoute,
  type ApprovalScope,
} from "@/api/approval-rules"

export const approvalRuleKeys = {
  all: ["approval-rules"] as const,
}

export function useApprovalRules(enabled = true) {
  return useQuery({
    queryKey: approvalRuleKeys.all,
    queryFn: () => listApprovalRules(),
    enabled,
  })
}

function useInvalidateApprovalRules() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: approvalRuleKeys.all })
    void queryClient.invalidateQueries({ queryKey: ["onboarding", "status"] })
  }
}

export function useReplaceApprovalMatrix() {
  const invalidate = useInvalidateApprovalRules()

  return useMutation({
    mutationFn: replaceApprovalMatrix,
    onSuccess: invalidate,
  })
}

export function useDeleteApprovalMatrix() {
  const invalidate = useInvalidateApprovalRules()

  return useMutation({
    mutationFn: (scope: ApprovalScope) => deleteApprovalMatrix(scope),
    onSuccess: invalidate,
  })
}

export function useSimulateRoute() {
  return useMutation({ mutationFn: simulateRoute })
}
