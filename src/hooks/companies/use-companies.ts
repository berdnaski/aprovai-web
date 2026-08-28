import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getMyCompany,
  updateCompany,
  updateCompanyPolicy,
} from "@/api/companies"

export const companyKeys = {
  me: ["companies", "me"] as const,
}

export function useMyCompany(enabled = true) {
  return useQuery({
    queryKey: companyKeys.me,
    queryFn: getMyCompany,
    enabled,
  })
}

function useCommitCompany() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: companyKeys.me })
    void queryClient.invalidateQueries({ queryKey: ["onboarding", "status"] })
  }
}

export function useUpdateCompany() {
  const commit = useCommitCompany()

  return useMutation({ mutationFn: updateCompany, onSuccess: commit })
}

export function useUpdateCompanyPolicy() {
  const commit = useCommitCompany()

  return useMutation({ mutationFn: updateCompanyPolicy, onSuccess: commit })
}
