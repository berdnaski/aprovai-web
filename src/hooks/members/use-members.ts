import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  disableMember,
  getMember,
  getMemberResponsibilities,
  listMembers,
  setMySubstitute,
  updateMemberLimit,
  updateMemberManager,
  updateMemberRole,
} from "@/api/members"
import {
  createInvite,
  listInvites,
  resendInvite,
  revokeInvite,
} from "@/api/invites"
import { transferCostCenterManagement } from "@/api/cost-centers"
import type { CompanyMemberRole } from "@/types/enums"

export const memberKeys = {
  all: ["members"] as const,
  detail: (id: string) => ["members", id] as const,
  responsibilities: (id: string) => ["members", id, "responsibilities"] as const,
  invites: ["invites"] as const,
}

export function useMembers(enabled = true) {
  return useQuery({
    queryKey: memberKeys.all,
    queryFn: listMembers,
    enabled,
  })
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: memberKeys.detail(id ?? ""),
    queryFn: () => getMember(id as string),
    enabled: Boolean(id),
  })
}

export function useMemberResponsibilities(id: string | undefined) {
  return useQuery({
    queryKey: memberKeys.responsibilities(id ?? ""),
    queryFn: () => getMemberResponsibilities(id as string),
    enabled: Boolean(id),
  })
}

export function useInvites() {
  return useQuery({
    queryKey: memberKeys.invites,
    queryFn: listInvites,
  })
}

function useInvalidateTeam() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: memberKeys.all })
    void queryClient.invalidateQueries({ queryKey: memberKeys.invites })
    void queryClient.invalidateQueries({ queryKey: ["cost-centers"] })
  }
}

export function useUpdateMemberRole(id: string) {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: (role: CompanyMemberRole) => updateMemberRole(id, role),
    onSuccess: invalidate,
  })
}

export function useUpdateMemberLimit(id: string) {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: (approvalLimitCents: string) =>
      updateMemberLimit(id, approvalLimitCents),
    onSuccess: invalidate,
  })
}

export function useUpdateMemberManager(id: string) {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: (managerId: string | null) => updateMemberManager(id, managerId),
    onSuccess: invalidate,
  })
}

export function useDisableMember() {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: disableMember,
    onSuccess: invalidate,
  })
}

export function useCreateInvite() {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: createInvite,
    onSuccess: invalidate,
  })
}

export function useResendInvite() {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: resendInvite,
    onSuccess: invalidate,
  })
}

export function useRevokeInvite() {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: revokeInvite,
    onSuccess: invalidate,
  })
}

export function useSetMySubstitute() {
  const invalidate = useInvalidateTeam()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setMySubstitute,
    onSuccess: () => {
      invalidate()
      void queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
    },
  })
}

export function useTransferManagement() {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: transferCostCenterManagement,
    onSuccess: invalidate,
  })
}
