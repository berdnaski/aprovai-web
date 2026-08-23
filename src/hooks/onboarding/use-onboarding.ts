import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  advanceOnboarding,
  completeOnboarding,
  getOnboardingStatus,
  lookupCompanyCnpj,
} from "@/api/onboarding"
import { createCompany, getMyCompany, listMembers } from "@/api/companies"
import { createCostCenter, listCostCenters } from "@/api/cost-centers"
import { createInvite, listInvites, revokeInvite } from "@/api/invites"

export const onboardingKeys = {
  status: ["onboarding", "status"] as const,
  company: ["companies", "me"] as const,
  members: ["members"] as const,
  costCenters: ["cost-centers"] as const,
  invites: ["invites"] as const,
}

export function useOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: onboardingKeys.status,
    queryFn: getOnboardingStatus,
    enabled,
  })
}

export function useMyCompany(enabled = true) {
  return useQuery({
    queryKey: onboardingKeys.company,
    queryFn: getMyCompany,
    enabled,
  })
}

export function useMembers(enabled = true) {
  return useQuery({
    queryKey: onboardingKeys.members,
    queryFn: listMembers,
    enabled,
  })
}

export function useCostCenters(enabled = true) {
  return useQuery({
    queryKey: onboardingKeys.costCenters,
    queryFn: () => listCostCenters(),
    enabled,
  })
}

export function useInvites(enabled = true) {
  return useQuery({
    queryKey: onboardingKeys.invites,
    queryFn: listInvites,
    enabled,
  })
}

export function useCreateCompany() {
  return useMutation({ mutationFn: createCompany })
}

export function useLookupCnpj() {
  return useMutation({ mutationFn: lookupCompanyCnpj })
}

export function useAdvanceOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: advanceOnboarding,
    onSuccess: (status) => {
      queryClient.setQueryData(onboardingKeys.status, status)
    },
  })
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.status })
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.company })
    },
  })
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCostCenter,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: onboardingKeys.costCenters,
      })
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.status })
    },
  })
}

export function useCreateInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInvite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.invites })
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.status })
    },
  })
}

export function useRevokeInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: revokeInvite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.invites })
    },
  })
}
