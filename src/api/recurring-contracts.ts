import { apiClient } from "@/api/client"
import type { RecurringFrequency, RecurringOccurrenceStatus } from "@/types/enums"

export interface RecurringContract {
  id: string
  sourceRequestId: string
  supplierId: string
  costCenterId: string
  categoryId: string | null
  chartAccountId: string | null
  title: string
  amountCents: string
  frequency: RecurringFrequency
  startDate: string
  nextOccurrenceDate: string
  active: boolean
  canceledAt: string | null
  cancelReason: string | null
  createdAt: string
}

export interface RecurringOccurrence {
  id: string
  periodStart: string
  periodEnd: string
  dueDate: string
  expectedAmountCents: string
  status: RecurringOccurrenceStatus
  invoiceId: string | null
  payableId: string | null
  overrideNote: string | null
  matchedAt: string | null
}

export interface CreateRecurringContractPayload {
  frequency: RecurringFrequency
  amountCents?: string
  startDate?: string
  costCenterId?: string
  categoryId?: string
  chartAccountId?: string
}

export interface ListRecurringContractsQuery {
  active?: boolean
  sourceRequestId?: string
}

export async function listRecurringContracts(
  query: ListRecurringContractsQuery = {},
): Promise<RecurringContract[]> {
  const { data } = await apiClient.get<RecurringContract[]>(
    "/recurring-contracts",
    { params: query },
  )
  return data
}

export async function getRecurringContract(
  id: string,
): Promise<RecurringContract> {
  const { data } = await apiClient.get<RecurringContract>(
    `/recurring-contracts/${id}`,
  )
  return data
}

export async function listRecurringOccurrences(
  contractId: string,
): Promise<RecurringOccurrence[]> {
  const { data } = await apiClient.get<RecurringOccurrence[]>(
    `/recurring-contracts/${contractId}/occurrences`,
  )
  return data
}

export async function createRecurringContract(
  requestId: string,
  payload: CreateRecurringContractPayload,
): Promise<RecurringContract> {
  const { data } = await apiClient.post<RecurringContract>(
    `/purchase-requests/${requestId}/recurring-contract`,
    payload,
  )
  return data
}

export async function cancelRecurringContract(
  id: string,
  reason: string,
): Promise<RecurringContract> {
  const { data } = await apiClient.post<RecurringContract>(
    `/recurring-contracts/${id}/cancel`,
    { reason },
  )
  return data
}

export async function linkInvoiceToRecurringContract(
  invoiceId: string,
  contractId: string,
  overrideNote?: string,
): Promise<{ id: string; status: string }> {
  const { data } = await apiClient.post<{ id: string; status: string }>(
    `/invoices/${invoiceId}/link-recurring-contract`,
    { contractId, overrideNote },
  )
  return data
}
