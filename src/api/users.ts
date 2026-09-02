import { apiClient } from "@/api/client"

export interface CurrentUser {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  emailVerified: boolean
  isSuperAdmin: boolean
  termsAcceptedAt: string | null
  createdAt: string
}

export interface UpdateUserPayload {
  name?: string
  phone?: string | null
}

export function avatarSrc(path: string | null): string | undefined {
  if (!path) {
    return undefined
  }

  const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"

  return new URL(path, new URL(base).origin).toString()
}

export async function getMe(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>("/users/me")
  return data
}

export async function updateMe(
  payload: UpdateUserPayload,
): Promise<CurrentUser> {
  const { data } = await apiClient.patch<CurrentUser>("/users/me", payload)
  return data
}

export async function deleteMe(): Promise<void> {
  await apiClient.delete("/users/me")
}

export async function uploadAvatar(file: File): Promise<CurrentUser> {
  const form = new FormData()
  form.append("avatar", file)

  const { data } = await apiClient.post<CurrentUser>("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function removeAvatar(): Promise<CurrentUser> {
  const { data } = await apiClient.delete<CurrentUser>("/users/me/avatar")
  return data
}
