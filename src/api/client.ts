import axios from "axios"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  withCredentials: true,
})

export interface ApiErrorBody {
  statusCode: number
  error: string
  message: string
  details?: Record<string, unknown>
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data.message ?? "Não foi possível concluir a operação."
  }

  return "Não foi possível concluir a operação."
}
