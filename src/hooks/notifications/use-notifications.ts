import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getPreferences,
  getUnreadCount,
  listNotifications,
  markAllRead,
  markRead,
  updatePreferences,
  type ListNotificationsQuery,
} from "@/api/notifications"

const POLL_MS = 30_000

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (query: ListNotificationsQuery) =>
    ["notifications", "list", query] as const,
  unread: ["notifications", "unread-count"] as const,
  preferences: ["notifications", "preferences"] as const,
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: getUnreadCount,
    enabled,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })
}

export function useNotifications(
  query: ListNotificationsQuery = {},
  enabled = true,
) {
  return useQuery({
    queryKey: notificationKeys.list(query),
    queryFn: () => listNotifications(query),
    enabled,
    placeholderData: (previous) => previous,
  })
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  }
}

export function useMarkRead() {
  const invalidate = useInvalidateNotifications()

  return useMutation({ mutationFn: markRead, onSuccess: invalidate })
}

export function useMarkAllRead() {
  const invalidate = useInvalidateNotifications()

  return useMutation({ mutationFn: markAllRead, onSuccess: invalidate })
}

export function usePreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences,
    queryFn: getPreferences,
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.preferences, data)
    },
  })
}
