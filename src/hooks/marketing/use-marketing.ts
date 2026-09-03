import { useMutation, useQuery } from "@tanstack/react-query"

import {
  joinWaitlist,
  listPublicPlans,
  listWaitlist,
  type JoinWaitlistPayload,
} from "@/api/marketing"

export function usePublicPlans() {
  return useQuery({
    queryKey: ["public", "plans"] as const,
    queryFn: listPublicPlans,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (payload: JoinWaitlistPayload) => joinWaitlist(payload),
  })
}

export function useWaitlist(params: {
  page?: number
  perPage?: number
  search?: string
}) {
  return useQuery({
    queryKey: ["platform", "waitlist", params] as const,
    queryFn: () => listWaitlist(params),
    placeholderData: (previous) => previous,
  })
}
