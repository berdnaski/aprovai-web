import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authKeys } from "@/hooks/auth/use-session"
import {
  deleteMe,
  exportMyData,
  getMe,
  removeAvatar,
  updateMe,
  uploadAvatar,
  type UpdateUserPayload,
} from "@/api/users"

export const userKeys = {
  me: ["users", "me"] as const,
}

export function useMe() {
  return useQuery({ queryKey: userKeys.me, queryFn: getMe })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateMe(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me })
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
    },
  })
}

export function useDeleteMe() {
  return useMutation({ mutationFn: deleteMe })
}

export function useExportMyData() {
  return useMutation({
    mutationFn: exportMyData,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const today = new Date().toISOString().slice(0, 10)

      link.href = url
      link.download = `aprovai-meus-dados-${today}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me })
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      void queryClient.invalidateQueries({ queryKey: ["members"] })
    },
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeAvatar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me })
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      void queryClient.invalidateQueries({ queryKey: ["members"] })
    },
  })
}
