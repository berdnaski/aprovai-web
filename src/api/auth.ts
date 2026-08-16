import { apiClient } from "@/api/client"

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
  termsAccepted?: boolean
}

export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>("/auth/register", payload)
  return data
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>("/auth/login", payload)
  return data
}
