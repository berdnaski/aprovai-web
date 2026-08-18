import { apiClient, SKIP_REFRESH_HEADER } from "@/api/client"
import type { CompanyMemberRole } from "@/types/enums"

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
  termsAccepted?: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  emailVerified: boolean
  isSuperAdmin: boolean
}

export interface AuthMembership {
  memberId: string
  companyId: string
  companyName: string
  role: CompanyMemberRole
}

export interface AuthResponse {
  user: AuthUser
  membership: AuthMembership | null
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>("/auth/register", payload)
  return data
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload)
  return data
}

interface SessionPayload {
  userId: string
  email: string
  emailVerified: boolean
  isSuperAdmin: boolean
  companyId?: string
  memberId?: string
  role?: CompanyMemberRole
}

interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  emailVerified: boolean
}

export async function me(): Promise<AuthResponse> {
  const noCache = {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      [SKIP_REFRESH_HEADER]: "1",
    },
  }

  const { data } = await apiClient.get<SessionPayload>("/auth/me", noCache)
  const profile = await apiClient.get<UserProfile>("/users/me", noCache)

  return {
    user: {
      id: data.userId,
      name: profile.data.name,
      email: data.email,
      avatarUrl: profile.data.avatarUrl,
      emailVerified: data.emailVerified,
      isSuperAdmin: data.isSuperAdmin,
    },
    membership:
      data.companyId && data.memberId && data.role
        ? {
            memberId: data.memberId,
            companyId: data.companyId,
            companyName: "",
            role: data.role,
          }
        : null,
  }
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout")
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post("/auth/resend-verification", { email })
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.get("/auth/verify-email", { params: { token } })
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email })
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await apiClient.post("/auth/reset-password", { token, password })
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiClient.post("/auth/change-password", payload)
}

export async function confirmPasswordChange(token: string): Promise<void> {
  await apiClient.post("/auth/confirm-password-change", { token })
}
