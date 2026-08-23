import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  listApprovalRules,
  replaceApprovalMatrix,
} from "@/api/approval-rules"

export const approvalRuleKeys = {
  all: ["approval-rules"] as const,
}

export function useApprovalRules(enabled = true) {
  return useQuery({
    queryKey: approvalRuleKeys.all,
    queryFn: listApprovalRules,
    enabled,
  })
}

export function useReplaceApprovalMatrix() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: replaceApprovalMatrix,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: approvalRuleKeys.all })
      void queryClient.invalidateQueries({ queryKey: ["onboarding", "status"] })
    },
  })
}
