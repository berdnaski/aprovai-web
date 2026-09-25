import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { refreshSession } from "@/api/auth"
import {
  acceptInvite,
  acceptPendingInvite,
  getInviteByToken,
  listMyPendingInvites,
} from "@/api/invites"
import { authKeys } from "@/hooks/auth/use-session"

export const inviteTokenKeys = {
  preview: (token: string) => ["invites", "token", token] as const,
  mine: ["invites", "mine"] as const,
}

export function useMyPendingInvites(enabled = true) {
  return useQuery({
    queryKey: inviteTokenKeys.mine,
    queryFn: listMyPendingInvites,
    enabled,
    retry: false,
  })
}

export function useAcceptPendingInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await acceptPendingInvite(id)
      await refreshSession()
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: authKeys.session })
    },
  })
}

export function useInvitePreview(token: string | undefined) {
  return useQuery({
    queryKey: inviteTokenKeys.preview(token ?? ""),
    queryFn: () => getInviteByToken(token as string),
    enabled: Boolean(token),
    retry: false,
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      await acceptInvite(token)
      await refreshSession()
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: authKeys.session })
    },
  })
}
