import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type {
  DecisionChannel,
  DecisionType,
  ExtractionStatus,
  RequestStatus,
  RequestView,
  StepStatus,
  Urgency,
} from "@/types/enums"

export interface PurchaseRequest {
  id: string
  number: string
  requesterId: string
  costCenterId: string
  categoryId: string | null
  supplierId: string | null
  title: string
  description: string | null
  totalAmountCents: string
  urgency: Urgency
  status: RequestStatus
  paymentTerms: string | null
  createdAt: string
  submittedAt: string | null
  finalizedAt: string | null
}

export interface RequestItem {
  id: string
  description: string
  quantity: string
  unit: string
  unitPriceCents: string
  totalCents: string
}

export interface RequestFile {
  id: string
  fileName: string
  mimeType: string
  sizeBytes: string
  uploadedAt: string
}

export interface ListRequestsQuery {
  view?: RequestView
  status?: RequestStatus[]
  costCenterId?: string
  supplierId?: string
  categoryId?: string
  search?: string
  page?: number
  perPage?: number
}

export async function listPurchaseRequests(
  query: ListRequestsQuery = {},
): Promise<Paginated<PurchaseRequest>> {
  const { data } = await apiClient.get<Paginated<PurchaseRequest>>(
    "/purchase-requests",
    { params: query },
  )
  return data
}

export async function getPurchaseRequest(id: string): Promise<PurchaseRequest> {
  const { data } = await apiClient.get<PurchaseRequest>(
    `/purchase-requests/${id}`,
  )
  return data
}

export interface CreateDraftPayload {
  costCenterId: string
  categoryId?: string
  supplierId?: string
  title: string
  description?: string
  urgency?: Urgency
  paymentTerms?: string
}

export async function createDraft(
  payload: CreateDraftPayload,
): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<PurchaseRequest>(
    "/purchase-requests",
    payload,
  )
  return data
}

export async function updateDraft(
  id: string,
  payload: Partial<CreateDraftPayload>,
): Promise<PurchaseRequest> {
  const { data } = await apiClient.patch<PurchaseRequest>(
    `/purchase-requests/${id}`,
    payload,
  )
  return data
}

export async function deleteDraft(id: string): Promise<void> {
  await apiClient.delete(`/purchase-requests/${id}`)
}

export async function duplicateRequest(id: string): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<PurchaseRequest>(
    `/purchase-requests/${id}/duplicate`,
  )
  return data
}

export async function submitRequest(
  id: string,
  confirmDuplicate = false,
): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<PurchaseRequest>(
    `/purchase-requests/${id}/submit`,
    { confirmDuplicate },
  )
  return data
}

export interface SimilarRequest {
  number: string
  amountCents: string
  createdAt: string
}

export interface DecidePayload {
  type: DecisionType
  justification?: string
  onBehalfOfId?: string
}

export async function decideRequest(
  id: string,
  payload: DecidePayload,
): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<PurchaseRequest>(
    `/purchase-requests/${id}/decisions`,
    payload,
  )
  return data
}

export async function cancelRequest(
  id: string,
  reason: string,
): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<PurchaseRequest>(
    `/purchase-requests/${id}/cancel`,
    { reason },
  )
  return data
}

export async function reassignStep(
  id: string,
  toMemberId: string,
): Promise<void> {
  await apiClient.post(`/purchase-requests/${id}/reassign`, { toMemberId })
}

export interface TimelineDecision {
  id: string
  type: DecisionType
  actor: string
  justification: string | null
  channel: DecisionChannel
  decidedAt: string
}

export interface TimelineStep {
  order: number
  status: StepStatus
  isCurrent: boolean
  expectedApproverId: string
  expectedApproverName: string
  requiresDualApproval: boolean
  escalatedFromName: string | null
  escalatedAt: string | null
  startedAt: string | null
  endedAt: string | null
  decisions: TimelineDecision[]
}

export interface RequestTimeline {
  requestId: string
  number: string
  status: RequestStatus
  createdAt: string
  submittedAt: string | null
  finalizedAt: string | null
  cancelReason: string | null
  currentStepOrder: number | null
  totalSteps: number
  steps: TimelineStep[]
}

export async function getTimeline(id: string): Promise<RequestTimeline> {
  const { data } = await apiClient.get<RequestTimeline>(
    `/purchase-requests/${id}/timeline`,
  )
  return data
}

export async function listItems(id: string): Promise<RequestItem[]> {
  const { data } = await apiClient.get<RequestItem[]>(
    `/purchase-requests/${id}/items`,
  )
  return data
}

export interface ItemPayload {
  description: string
  quantity: string
  unit: string
  unitPriceCents: string
}

export async function addItem(
  id: string,
  payload: ItemPayload,
): Promise<RequestItem> {
  const { data } = await apiClient.post<RequestItem>(
    `/purchase-requests/${id}/items`,
    payload,
  )
  return data
}

export async function updateItem(
  id: string,
  itemId: string,
  payload: ItemPayload,
): Promise<RequestItem> {
  const { data } = await apiClient.patch<RequestItem>(
    `/purchase-requests/${id}/items/${itemId}`,
    payload,
  )
  return data
}

export async function deleteItem(id: string, itemId: string): Promise<void> {
  await apiClient.delete(`/purchase-requests/${id}/items/${itemId}`)
}

export async function listFiles(id: string): Promise<RequestFile[]> {
  const { data } = await apiClient.get<RequestFile[]>(
    `/purchase-requests/${id}/files`,
  )
  return data
}

export async function uploadFile(
  id: string,
  file: File,
): Promise<RequestFile> {
  const form = new FormData()
  form.append("file", file)

  const { data } = await apiClient.post<RequestFile>(
    `/purchase-requests/${id}/files`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return data
}

export interface DownloadLink {
  url: string
  expiresInSeconds: number
}

export async function getFileDownloadUrl(
  id: string,
  fileId: string,
): Promise<DownloadLink> {
  const { data } = await apiClient.get<DownloadLink>(
    `/purchase-requests/${id}/files/${fileId}/download`,
  )
  return data
}

export async function deleteFile(id: string, fileId: string): Promise<void> {
  await apiClient.delete(`/purchase-requests/${id}/files/${fileId}`)
}

export interface ExtractedFields {
  supplierCnpj: string | null
  supplierName: string | null
  totalAmountCents: string | null
  categoryName: string | null
  paymentTerms: string | null
}

export interface Extraction {
  status: ExtractionStatus
  fields: ExtractedFields | null
  failureReason: string | null
}

export interface ExtractionPayload {
  text?: string
  fileId?: string
}

export async function requestExtraction(
  id: string,
  payload: ExtractionPayload,
): Promise<Extraction> {
  const { data } = await apiClient.post<Extraction>(
    `/purchase-requests/${id}/extract`,
    payload,
  )
  return data
}

export async function getExtraction(id: string): Promise<Extraction> {
  const { data } = await apiClient.get<Extraction>(
    `/purchase-requests/${id}/extract`,
  )
  return data
}
