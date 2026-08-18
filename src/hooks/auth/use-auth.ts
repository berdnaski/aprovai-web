import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import {
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "@/api/auth"

import { authKeys, useSessionActions } from "./use-session"

export { authKeys }

export function useRegister() {
  return useMutation({ mutationFn: register })
}

export function useLogin() {
  const { setSession } = useSessionActions()

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => setSession(session),
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { clearSession } = useSessionActions()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession()
      navigate("/entrar", { replace: true })
    },
  })
}

export function useResendVerification() {
  return useMutation({ mutationFn: resendVerification })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      resetPassword(input.token, input.password),
  })
}

export { verifyEmail }
