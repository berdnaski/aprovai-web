import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type { OnboardingStep, SubscriptionStatus } from "@/types/enums"

export interface FeatureOption {
  key: string
  label: string
}

export interface Plan {
  id: string
  name: string
  tier: "BASIC" | "PROFESSIONAL" | "ENTERPRISE"
  priceCents: string
  maxMembers: number | null
  maxRequestsMonth: number | null
  maxStorageBytes: string | null
  features: string[]
}

export interface PlanWithUsage extends Plan {
  active: boolean
  subscriptions: number
}

export interface Organization {
  companyId: string
  legalName: string
  tradeName: string | null
  cnpj: string
  onboardingStep: OnboardingStep
  disabledAt: string | null
  createdAt: string
  plan: Plan | null
  subscriptionStatus: SubscriptionStatus | null
  usedSeats: number
}

export interface PlatformSubscription {
  id: string
  planId: string
  status: SubscriptionStatus
  periodStart: string
  periodEnd: string | null
  featureOverrides: string[]
  overridesExpireAt: string | null
}

export interface ListOrganizationsQuery {
  search?: string
  page?: number
  perPage?: number
}

export async function listOrganizations(
  query: ListOrganizationsQuery = {},
): Promise<Paginated<Organization>> {
  const { data } = await apiClient.get<Paginated<Organization>>(
    "/platform/organizations",
    { params: query },
  )
  return data
}

export async function getOrganization(
  companyId: string,
): Promise<Organization> {
  const { data } = await apiClient.get<Organization>(
    `/platform/organizations/${companyId}`,
  )
  return data
}

export async function listPlans(): Promise<PlanWithUsage[]> {
  const { data } = await apiClient.get<PlanWithUsage[]>("/platform/plans")
  return data
}

export async function listFeatureCatalog(): Promise<FeatureOption[]> {
  const { data } = await apiClient.get<FeatureOption[]>("/platform/features")
  return data
}

export interface WritePlanPayload {
  name: string
  tier: Plan["tier"]
  priceCents: string
  maxMembers?: number | null
  maxRequestsMonth?: number | null
  maxStorageBytes?: string | null
  features: string[]
  active?: boolean
}

export async function createPlan(payload: WritePlanPayload): Promise<Plan> {
  const { data } = await apiClient.post<Plan>("/platform/plans", payload)
  return data
}

export async function updatePlan(
  planId: string,
  payload: Partial<Omit<WritePlanPayload, "tier">>,
): Promise<Plan> {
  const { data } = await apiClient.patch<Plan>(
    `/platform/plans/${planId}`,
    payload,
  )
  return data
}

export interface AssignPlanPayload {
  planId: string
  status?: SubscriptionStatus
  periodEnd?: string
  contractedPriceCents?: string
}

export async function assignPlan(
  companyId: string,
  payload: AssignPlanPayload,
): Promise<PlatformSubscription> {
  const { data } = await apiClient.post<PlatformSubscription>(
    `/platform/organizations/${companyId}/plan`,
    payload,
  )
  return data
}

export interface GrantOverridePayload {
  features: string[]
  expiresAt?: string
}

export async function grantFeatureOverride(
  companyId: string,
  payload: GrantOverridePayload,
): Promise<PlatformSubscription> {
  const { data } = await apiClient.post<PlatformSubscription>(
    `/platform/organizations/${companyId}/feature-overrides`,
    payload,
  )
  return data
}
