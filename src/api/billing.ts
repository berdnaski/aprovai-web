import { apiClient } from "@/api/client"
import type { Plan } from "@/api/platform"
import type { SubscriptionStatus } from "@/types/enums"

export interface Subscription {
  plan: Plan | null
  status: SubscriptionStatus | null
  renewsAt: string | null
  features: string[]
  usedSeats: number
  maxMembers: number | null
  usedRequestsMonth: number
  maxRequestsMonth: number | null
  hasActiveSubscription: boolean
}

export async function getSubscription(): Promise<Subscription> {
  const { data } = await apiClient.get<Subscription>("/billing/subscription")
  return data
}

export async function listAvailablePlans(): Promise<Plan[]> {
  const { data } = await apiClient.get<Plan[]>("/billing/plans")
  return data
}
