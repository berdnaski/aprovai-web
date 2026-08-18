import { apiClient } from "@/api/client"
import type { OnboardingStep } from "@/types/enums"

export interface OnboardingRequirement {
  key: string
  label: string
  done: boolean
  required: boolean
}

export interface OnboardingStatus {
  step: OnboardingStep
  completedAt: string | null
  requirements: OnboardingRequirement[]
  canComplete: boolean
}

export interface CnpjLookupAddress {
  street: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

export interface CnpjLookupResult {
  cnpj: string
  legalName: string
  tradeName: string | null
  registrationStatus: string
  address: CnpjLookupAddress
  email: string | null
  phone: string | null
}

export type CnpjLookupOutcome =
  | { ok: true; data: CnpjLookupResult }
  | { ok: false; failure: string; message: string }

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const { data } = await apiClient.get<OnboardingStatus>("/onboarding")
  return data
}

export async function advanceOnboarding(
  step: OnboardingStep,
): Promise<OnboardingStatus> {
  const { data } = await apiClient.patch<OnboardingStatus>("/onboarding/step", {
    step,
  })
  return data
}

export async function completeOnboarding(): Promise<void> {
  await apiClient.post("/onboarding/complete")
}

export async function lookupCompanyCnpj(
  cnpj: string,
): Promise<CnpjLookupOutcome> {
  const { data } = await apiClient.get<CnpjLookupOutcome>(
    `/onboarding/cnpj/${cnpj.replace(/\D/g, "")}`,
  )
  return data
}
