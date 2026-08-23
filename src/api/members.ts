import { apiClient } from "@/api/client"
import type { CompanyMemberRole } from "@/types/enums"

export interface MemberUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface Member {
  id: string
  userId: string
  user?: MemberUser
  role: CompanyMemberRole
  approvalLimitCents: string
  defaultCostCenterId: string | null
  managerId: string | null
  absentFrom: string | null
  absentUntil: string | null
  substituteId: string | null
  createdAt: string
}

export async function listMembers(): Promise<Member[]> {
  const { data } = await apiClient.get<Member[]>("/members")
  return data
}

export async function getMember(id: string): Promise<Member> {
  const { data } = await apiClient.get<Member>(`/members/${id}`)
  return data
}

export interface ResponsibilityItem {
  id: string
  label: string
  details?: Record<string, string | null>
}

export interface ResponsibilityBlocker {
  kind: "COST_CENTER_MANAGER" | "PENDING_APPROVAL"
  message: string
  items: ResponsibilityItem[]
}

export interface MemberRef {
  id: string
  userId: string
}

export interface MemberResponsibilities {
  blockers: ResponsibilityBlocker[]
  subordinates: MemberRef[]
  substituteFor: MemberRef[]
}

export async function getMemberResponsibilities(
  id: string,
): Promise<MemberResponsibilities> {
  const { data } = await apiClient.get<MemberResponsibilities>(
    `/members/${id}/responsibilities`,
  )
  return data
}

export async function updateMemberRole(
  id: string,
  role: CompanyMemberRole,
): Promise<Member> {
  const { data } = await apiClient.patch<Member>(`/members/${id}/role`, { role })
  return data
}

export async function updateMemberLimit(
  id: string,
  approvalLimitCents: string,
): Promise<Member> {
  const { data } = await apiClient.patch<Member>(`/members/${id}/limit`, {
    approvalLimitCents,
  })
  return data
}

export async function updateMemberManager(
  id: string,
  managerId: string | null,
): Promise<Member> {
  const { data } = await apiClient.patch<Member>(`/members/${id}/manager`, {
    managerId,
  })
  return data
}

export async function disableMember(id: string): Promise<void> {
  await apiClient.delete(`/members/${id}`)
}

export interface SetSubstitutePayload {
  substituteId: string | null
  absentFrom?: string | null
  absentUntil?: string | null
}

export async function setMySubstitute(
  payload: SetSubstitutePayload,
): Promise<Member> {
  const { data } = await apiClient.patch<Member>(
    "/members/me/substitute",
    payload,
  )
  return data
}
