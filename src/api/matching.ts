import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type { DivergenceKind, MatchStatus } from "@/types/enums"

export interface MatchDivergence {
  kind: DivergenceKind
  expectedValue: string
  actualValue: string
  differenceCents: string | null
  differencePercent: string | null
}

export interface MatchResult {
  id: string
  purchaseOrderId: string
  invoiceId: string
  status: MatchStatus
  checkedAt: string
  priceTolerancePercent: string
  quantityTolerancePercent: string
  orderedAmountCents: string
  receivedAmountCents: string
  invoicedAmountCents: string
  resolutionNote: string | null
  divergences?: MatchDivergence[]
}

export interface ListMatchResultsQuery {
  status?: MatchStatus[]
  page?: number
  perPage?: number
}

export async function listMatchResults(
  query: ListMatchResultsQuery = {},
): Promise<Paginated<MatchResult>> {
  const { data } = await apiClient.get<Paginated<MatchResult>>(
    "/match-results",
    { params: query },
  )
  return data
}

export async function getMatchResult(id: string): Promise<MatchResult> {
  const { data } = await apiClient.get<MatchResult>(`/match-results/${id}`)
  return data
}

export async function overrideMatch(
  id: string,
  note: string,
): Promise<MatchResult> {
  const { data } = await apiClient.post<MatchResult>(
    `/match-results/${id}/override`,
    { note },
  )
  return data
}

export async function runMatch(invoiceId: string): Promise<MatchResult> {
  const { data } = await apiClient.post<MatchResult>(
    `/invoices/${invoiceId}/match`,
  )
  return data
}
