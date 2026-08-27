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

export interface ApprovalScope {
  costCenterId: string | null
  categoryId: string | null
}

export interface ReplaceApprovalMatrixPayload extends ApprovalScope {
  ranges: ApprovalRuleRange[]
}

function scopeParams(scope?: Partial<ApprovalScope>) {
  if (!scope) {
    return undefined
  }

  const params: Record<string, string> = {}

  if (scope.costCenterId) {
    params.costCenterId = scope.costCenterId
  }

  if (scope.categoryId) {
    params.categoryId = scope.categoryId
  }

  return Object.keys(params).length > 0 ? params : undefined
}

export async function listApprovalRules(
  scope?: Partial<ApprovalScope>,
): Promise<ApprovalRule[]> {
  const { data } = await apiClient.get<ApprovalRule[]>("/approval-rules", {
    params: scopeParams(scope),
  })
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

export async function deleteApprovalMatrix(
  scope: ApprovalScope,
): Promise<ApprovalRule[]> {
  const { data } = await apiClient.delete<ApprovalRule[]>("/approval-rules", {
    params: scopeParams(scope),
  })
  return data
}

export interface ResolveApprovalRuleQuery extends Partial<ApprovalScope> {
  amountCents: string
}

export async function resolveApprovalRule(
  query: ResolveApprovalRuleQuery,
): Promise<ApprovalRule> {
  const { data } = await apiClient.get<ApprovalRule>("/approval-rules/resolve", {
    params: { amountCents: query.amountCents, ...scopeParams(query) },
  })
  return data
}

export interface SimulateRoutePayload {
  amountCents: string
  costCenterId: string
  requesterId: string
  categoryId?: string
  at?: string
}

export interface SimulatedStep {
  stepOrder: number
  expectedApproverId: string
  onBehalfOfId: string | null
  requiresDualApproval: boolean
}

export interface SimulatedRoute {
  ruleId: string
  totalSteps: number
  steps: SimulatedStep[]
}

export async function simulateRoute(
  payload: SimulateRoutePayload,
): Promise<SimulatedRoute> {
  const { data } = await apiClient.post<SimulatedRoute>(
    "/approval-rules/simulate",
    payload,
  )
  return data
}
