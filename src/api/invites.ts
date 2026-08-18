import { apiClient } from "@/api/client"
import type { CompanyMemberRole } from "@/types/enums"

export interface Invite {
  id: string
  email: string
  role: CompanyMemberRole
  defaultCostCenterId: string | null
  managerId: string | null
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
  createdAt: string
  acceptedAt: string | null
}

export interface CreateInvitePayload {
  email: string
  role: CompanyMemberRole
  defaultCostCenterId?: string
  managerId?: string
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

export async function revokeInvite(id: string): Promise<void> {
  await apiClient.delete(`/invites/${id}`)
}
