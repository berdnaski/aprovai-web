import axios from "axios"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  withCredentials: true,
  paramsSerializer: {
    indexes: null,
  },
})

export interface ApiErrorBody {
  statusCode: number
  error: string
  message: string
  details?: Record<string, unknown>
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/forgot-password",
  "/auth/reset-password",
]

let refreshInFlight: Promise<void> | null = null

function runRefresh(): Promise<void> {
  refreshInFlight ??= apiClient
    .post("/auth/refresh")
    .then(() => undefined)
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}

export const SKIP_REFRESH_HEADER = "X-Skip-Refresh"

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const config = error.config
    const url = config?.url ?? ""
    const isPublic = PUBLIC_PATHS.some((path) => url.includes(path))
    const skipRefresh = Boolean(config?.headers?.[SKIP_REFRESH_HEADER])
    const alreadyRetried = (config as { _retried?: boolean } | undefined)
      ?._retried

    if (isPublic || skipRefresh || !config || alreadyRetried) {
      if (!isPublic && !skipRefresh) {
        onUnauthorized?.()
      }
      return Promise.reject(error)
    }

    try {
      await runRefresh()
      ;(config as { _retried?: boolean })._retried = true
      return await apiClient.request(config)
    } catch (refreshError) {
      onUnauthorized?.()
      return Promise.reject(refreshError)
    }
  },
)

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message

    if (Array.isArray(message)) {
      return message[0] ?? "Não foi possível concluir a operação."
    }

    return message ?? "Não foi possível concluir a operação."
  }

  return "Não foi possível concluir a operação."
}

export function getApiErrorCode(error: unknown): string | null {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error ?? null
  }

  return null
}

export function getApiErrorDetails(
  error: unknown,
): Record<string, unknown> | undefined {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.details
  }

  return undefined
}

export function getApiErrorStatus(error: unknown): number | null {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null
  }

  return null
}
