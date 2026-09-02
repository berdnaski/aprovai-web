import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  assignPlan,
  createPlan,
  getOrganization,
  listFeatureCatalog,
  grantFeatureOverride,
  listOrganizations,
  listPlans,
  type AssignPlanPayload,
  type GrantOverridePayload,
  type ListOrganizationsQuery,
  type WritePlanPayload,
  updatePlan,
} from "@/api/platform"

export const platformKeys = {
  all: ["platform"] as const,
  organizations: (query: ListOrganizationsQuery) =>
    ["platform", "organizations", query] as const,
  organization: (companyId: string) =>
    ["platform", "organization", companyId] as const,
  plans: ["platform", "plans"] as const,
  features: ["platform", "features"] as const,
}

export function useOrganizations(query: ListOrganizationsQuery = {}) {
  return useQuery({
    queryKey: platformKeys.organizations(query),
    queryFn: () => listOrganizations(query),
    placeholderData: (previous) => previous,
  })
}

export function useOrganization(companyId: string | undefined) {
  return useQuery({
    queryKey: platformKeys.organization(companyId ?? ""),
    queryFn: () => getOrganization(companyId as string),
    enabled: Boolean(companyId),
  })
}

export function usePlans() {
  return useQuery({ queryKey: platformKeys.plans, queryFn: listPlans })
}

export function useFeatureCatalog() {
  return useQuery({
    queryKey: platformKeys.features,
    queryFn: listFeatureCatalog,
    staleTime: Infinity,
  })
}

function useInvalidatePlatform() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: platformKeys.all })
  }
}

export function useAssignPlan(companyId: string) {
  const invalidate = useInvalidatePlatform()

  return useMutation({
    mutationFn: (payload: AssignPlanPayload) => assignPlan(companyId, payload),
    onSuccess: invalidate,
  })
}

export function useGrantOverride(companyId: string) {
  const invalidate = useInvalidatePlatform()

  return useMutation({
    mutationFn: (payload: GrantOverridePayload) =>
      grantFeatureOverride(companyId, payload),
    onSuccess: invalidate,
  })
}

export function useCreatePlan() {
  const invalidate = useInvalidatePlatform()

  return useMutation({
    mutationFn: (payload: WritePlanPayload) => createPlan(payload),
    onSuccess: invalidate,
  })
}

export function useUpdatePlan(planId: string) {
  const invalidate = useInvalidatePlatform()

  return useMutation({
    mutationFn: (payload: Partial<Omit<WritePlanPayload, "tier">>) =>
      updatePlan(planId, payload),
    onSuccess: invalidate,
  })
}
