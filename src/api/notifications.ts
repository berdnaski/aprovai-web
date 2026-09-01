import { apiClient } from "@/api/client"
import type { Paginated } from "@/api/pagination"

export interface Notification {
  id: string
  event: string
  title: string
  message: string
  link: string | null
  readAt: string | null
  createdAt: string
}

export interface ListNotificationsQuery {
  page?: number
  perPage?: number
  unreadOnly?: boolean
}

export async function listNotifications(
  query: ListNotificationsQuery = {},
): Promise<Paginated<Notification>> {
  const { data } = await apiClient.get<Paginated<Notification>>(
    "/notifications",
    { params: query },
  )
  return data
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ unread: number }>(
    "/notifications/unread-count",
  )
  return data.unread
}

export async function markRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all")
}

export interface NotificationPreference {
  event: string
  emailEnabled: boolean
}

export async function getPreferences(): Promise<NotificationPreference[]> {
  const { data } = await apiClient.get<NotificationPreference[]>(
    "/notifications/preferences",
  )
  return data
}

export async function updatePreferences(
  preferences: NotificationPreference[],
): Promise<NotificationPreference[]> {
  const { data } = await apiClient.patch<NotificationPreference[]>(
    "/notifications/preferences",
    { preferences },
  )
  return data
}
