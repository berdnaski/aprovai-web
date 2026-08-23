import { apiClient } from "@/api/client"
import type { CompanyMemberRole, InviteStatus } from "@/types/enums"

export interface Invite {
  id: string
  email: string
  role: CompanyMemberRole
  status: InviteStatus
  defaultCostCenterId: string | null
  managerId: string | null
  createdAt: string
  acceptedAt: string | null
}

export interface CreateInvitePayload {
  email: string
  role: CompanyMemberRole
  defaultCostCenterId?: string
  managerId?: string
}

export interface InvitePreview {
  companyName: string
  email: string
  role: CompanyMemberRole
  expiresAt: string
}

export async function listInvites(): Promise<Invite[]> {
  const { data } = await apiClient.get<Invite[]>("/invites")
  return data
}

export async function createInvite(
  payload: CreateInvitePayload,
): Promise<Invite> {
  const { data } = await apiClient.post<Invite>("/invites", payload)
  return data
}

export async function resendInvite(id: string): Promise<Invite> {
  const { data } = await apiClient.post<Invite>(`/invites/${id}/resend`)
  return data
}

export async function revokeInvite(id: string): Promise<void> {
  await apiClient.delete(`/invites/${id}`)
}

export async function getInviteByToken(token: string): Promise<InvitePreview> {
  const { data } = await apiClient.get<InvitePreview>(`/invites/token/${token}`)
  return data
}

export async function acceptInvite(token: string): Promise<void> {
  await apiClient.post(`/invites/token/${token}/accept`)
}
