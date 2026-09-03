import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getFeedbackCounters,
  getFeedbackScreenshotUrl,
  listMyFeedbacks,
  listPlatformFeedbacks,
  submitFeedback,
  triageFeedback,
  type ListFeedbacksParams,
  type SubmitFeedbackPayload,
} from "@/api/feedback"
import type { FeedbackStatus } from "@/types/enums"

export const feedbackKeys = {
  all: ["feedback"] as const,
  mine: ["feedback", "mine"] as const,
  platform: (params: ListFeedbacksParams) =>
    ["feedback", "platform", params] as const,
  counters: (companyId?: string) =>
    ["feedback", "counters", companyId ?? "all"] as const,
}

export function useMyFeedbacks(enabled = true) {
  return useQuery({
    queryKey: feedbackKeys.mine,
    queryFn: () => listMyFeedbacks({ perPage: 20 }),
    enabled,
  })
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) => submitFeedback(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedbackKeys.all })
    },
  })
}

export function usePlatformFeedbacks(params: ListFeedbacksParams) {
  return useQuery({
    queryKey: feedbackKeys.platform(params),
    queryFn: () => listPlatformFeedbacks(params),
    placeholderData: (previous) => previous,
  })
}

export function useFeedbackCounters(companyId?: string) {
  return useQuery({
    queryKey: feedbackKeys.counters(companyId),
    queryFn: () => getFeedbackCounters(companyId),
  })
}

export function useTriageFeedback(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      status: FeedbackStatus
      internalNote?: string
      reply?: string
    }) => triageFeedback(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedbackKeys.all })
    },
  })
}

export function useFeedbackScreenshot(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["feedback", "screenshot", id] as const,
    queryFn: () => getFeedbackScreenshotUrl(id),
    enabled,
    staleTime: 60_000,
  })
}
