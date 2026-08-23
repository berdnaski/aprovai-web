import { apiClient } from "@/api/client"
import type { ApproverType } from "@/types/enums"

export interface ApprovalRule {
  id: string
  costCenterId: string | null
  categoryId: string | null
  minAmountCents: string
  maxAmountCents: string | null
  approverType: ApproverType
  requiresDualApproval: boolean
  isActive: boolean
}

export interface ApprovalRuleRange {
  minAmountCents: string
  maxAmountCents?: string | null
  approverType: ApproverType
  requiresDualApproval?: boolean
}

export interface ReplaceApprovalMatrixPayload {
  costCenterId?: string | null
  categoryId?: string | null
  ranges: ApprovalRuleRange[]
}

export async function listApprovalRules(): Promise<ApprovalRule[]> {
  const { data } = await apiClient.get<ApprovalRule[]>("/approval-rules")
  return data
}

export async function replaceApprovalMatrix(
  payload: ReplaceApprovalMatrixPayload,
): Promise<ApprovalRule[]> {
  const { data } = await apiClient.put<ApprovalRule[]>(
    "/approval-rules",
    payload,
  )
  return data
}
