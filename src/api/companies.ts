import { apiClient } from "@/api/client"
import type { CompanyMemberRole, OnboardingStep } from "@/types/enums"

export interface CreateCompanyPayload {
  legalName: string
  tradeName?: string
  cnpj: string
  industry?: string
  companySize?: string
}

export interface Company {
  id: string
  legalName: string
  tradeName: string | null
  cnpj: string
  industry: string | null
  companySize: string | null
  onboardingStep: OnboardingStep
  onboardingCompletedAt: string | null
  overrunTolerancePercent: number
  reminderHours: number
  escalationHours: number
  dualApprovalThresholdCents: string | null
  createdAt: string
}

export interface CompanyMember {
  id: string
  userId: string
  role: CompanyMemberRole
  approvalLimitCents: string
  defaultCostCenterId: string | null
  managerId: string | null
  absentFrom: string | null
  absentUntil: string | null
  substituteId: string | null
  createdAt: string
}

export async function createCompany(
  payload: CreateCompanyPayload,
): Promise<Company> {
  const { data } = await apiClient.post<Company>("/companies", payload)
  return data
}

export async function getMyCompany(): Promise<Company> {
  const { data } = await apiClient.get<Company>("/companies/me")
  return data
}

export interface UpdateCompanyPayload {
  legalName?: string
  tradeName?: string | null
  industry?: string | null
  companySize?: string | null
}

export async function updateCompany(
  payload: UpdateCompanyPayload,
): Promise<Company> {
  const { data } = await apiClient.patch<Company>("/companies/me", payload)
  return data
}

export interface UpdateCompanyPolicyPayload {
  overrunTolerancePercent?: number
  reminderHours?: number
  escalationHours?: number
  dualApprovalThresholdCents?: string | null
}

export async function updateCompanyPolicy(
  payload: UpdateCompanyPolicyPayload,
): Promise<Company> {
  const { data } = await apiClient.patch<Company>(
    "/companies/me/policy",
    payload,
  )
  return data
}

export async function listMembers(): Promise<CompanyMember[]> {
  const { data } = await apiClient.get<CompanyMember[]>("/members")
  return data
}
