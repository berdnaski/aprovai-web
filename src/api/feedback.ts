import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"
import type { FeedbackKind, FeedbackStatus } from "@/types/enums"

export interface FeedbackPerson {
  id: string
  name: string
  email: string
}

export interface FeedbackCompany {
  id: string
  name: string
}

export interface Feedback {
  id: string
  kind: FeedbackKind
  status: FeedbackStatus
  message: string
  route: string | null
  userAgent: string | null
  hasScreenshot: boolean
  internalNote: string | null
  reply: string | null
  repliedAt: string | null
  triagedAt: string | null
  createdAt: string
  author: FeedbackPerson | null
  triagedBy: FeedbackPerson | null
  company: FeedbackCompany | null
}

export interface FeedbackCounters {
  total: number
  byStatus: Record<FeedbackStatus, number>
  byKind: Record<FeedbackKind, number>
}

export interface SubmitFeedbackPayload {
  kind: FeedbackKind
  message: string
  route?: string
  screenshot?: File | null
}

export interface ListFeedbacksParams {
  page?: number
  perPage?: number
  companyId?: string
  status?: FeedbackStatus[]
  kind?: FeedbackKind[]
  search?: string
}

function toQuery(params: ListFeedbacksParams) {
  return {
    page: params.page,
    perPage: params.perPage,
    companyId: params.companyId,
    status: params.status?.length ? params.status.join(",") : undefined,
    kind: params.kind?.length ? params.kind.join(",") : undefined,
    search: params.search || undefined,
  }
}

export async function submitFeedback(
  payload: SubmitFeedbackPayload,
): Promise<Feedback> {
  const form = new FormData()

  form.append("kind", payload.kind)
  form.append("message", payload.message)

  if (payload.route) {
    form.append("route", payload.route)
  }

  if (payload.screenshot) {
    form.append("screenshot", payload.screenshot)
  }

  const { data } = await apiClient.post<Feedback>("/feedbacks", form)
  return data
}

export async function listMyFeedbacks(
  params: ListFeedbacksParams = {},
): Promise<Paginated<Feedback>> {
  const { data } = await apiClient.get<Paginated<Feedback>>("/feedbacks/mine", {
    params: toQuery(params),
  })
  return data
}

export async function listPlatformFeedbacks(
  params: ListFeedbacksParams = {},
): Promise<Paginated<Feedback>> {
  const { data } = await apiClient.get<Paginated<Feedback>>(
    "/platform/feedbacks",
    { params: toQuery(params) },
  )
  return data
}

export async function getFeedbackCounters(
  companyId?: string,
): Promise<FeedbackCounters> {
  const { data } = await apiClient.get<FeedbackCounters>(
    "/platform/feedbacks/counters",
    { params: companyId ? { companyId } : undefined },
  )
  return data
}

export async function triageFeedback(
  id: string,
  payload: { status: FeedbackStatus; internalNote?: string; reply?: string },
): Promise<Feedback> {
  const { data } = await apiClient.patch<Feedback>(
    `/platform/feedbacks/${id}`,
    payload,
  )
  return data
}

export async function getFeedbackScreenshotUrl(id: string): Promise<string> {
  const { data } = await apiClient.get<{ url: string }>(
    `/platform/feedbacks/${id}/screenshot`,
  )
  return data.url
}
