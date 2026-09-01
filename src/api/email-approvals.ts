import { apiClient } from "@/api/client"
import type { RequestStatus } from "@/types/enums"

export interface EmailApproval {
  number: string
  title: string
  totalAmountCents: string
  status: RequestStatus
  requesterName: string
  approverName: string
  actionable: boolean
  reason: string | null
}

export type EmailDecision = "APPROVED" | "REJECTED"

export interface DecideByEmailPayload {
  type: EmailDecision
  justification?: string
}

export async function getEmailApproval(token: string): Promise<EmailApproval> {
  const { data } = await apiClient.get<EmailApproval>(
    `/email-approvals/${token}`,
  )
  return data
}

export async function decideByEmail(
  token: string,
  payload: DecideByEmailPayload,
): Promise<void> {
  await apiClient.post(`/email-approvals/${token}`, payload)
}
