import { useMutation, useQuery } from "@tanstack/react-query"

import {
  decideByEmail,
  getEmailApproval,
  type DecideByEmailPayload,
} from "@/api/email-approvals"

export const emailApprovalKeys = {
  detail: (token: string) => ["email-approvals", token] as const,
}

export function useEmailApproval(token: string | undefined) {
  return useQuery({
    queryKey: emailApprovalKeys.detail(token ?? ""),
    queryFn: () => getEmailApproval(token as string),
    enabled: Boolean(token),
    retry: false,
  })
}

export function useDecideByEmail(token: string | undefined) {
  return useMutation({
    mutationFn: (payload: DecideByEmailPayload) =>
      decideByEmail(token as string, payload),
  })
}
