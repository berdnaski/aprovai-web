import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"

export interface PublicPlan {
  id: string
  name: string
  tier: string
  priceCents: string
  maxRequestsMonth: number | null
  maxMembers: number | null
  features: string[]
}

export interface WaitlistJoined {
  position: number
  alreadyOnList: boolean
}

export interface JoinWaitlistPayload {
  email: string
  name?: string
  company?: string
  source?: string
}

export async function listPublicPlans(): Promise<PublicPlan[]> {
  const { data } = await apiClient.get<PublicPlan[]>("/public/plans")
  return data
}

export async function joinWaitlist(
  payload: JoinWaitlistPayload,
): Promise<WaitlistJoined> {
  const { data } = await apiClient.post<WaitlistJoined>(
    "/public/waitlist",
    payload,
  )
  return data
}

export interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  company: string | null
  source: string | null
  invitedAt: string | null
  createdAt: string
}

export async function listWaitlist(params: {
  page?: number
  perPage?: number
  search?: string
}): Promise<Paginated<WaitlistEntry>> {
  const { data } = await apiClient.get<Paginated<WaitlistEntry>>(
    "/platform/waitlist",
    { params: { ...params, search: params.search || undefined } },
  )
  return data
}
