import { Route } from "react-router-dom"

import { EmailApprovalPage } from "@/features/email-approvals/email-approval-page"
import { AcceptInvitePage } from "@/features/invites/accept-invite-page"
import { ConfirmPasswordChangePage } from "@/features/auth/confirm-password-change-page"
import { ForgotPasswordPage } from "@/features/auth/forgot-password-page"
import { LoginPage } from "@/features/auth/login-page"
import { RegisterPage } from "@/features/auth/register-page"
import { ResetPasswordPage } from "@/features/auth/reset-password-page"
import { VerifyEmailPage } from "@/features/auth/verify-email-page"
import { RedirectIfAuthenticated } from "@/routes/guards"

export function tokenRoutes() {
  return (
    <>
      <Route path="/aprovacoes/:token" element={<EmailApprovalPage />} />
      <Route path="/convite/:token" element={<AcceptInvitePage />} />
      <Route path="/convites/:token" element={<AcceptInvitePage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/confirm-password-change"
        element={<ConfirmPasswordChangePage />}
      />
    </>
  )
}

export function guestRoutes() {
  return (
    <Route element={<RedirectIfAuthenticated />}>
      <Route path="/registrar" element={<RegisterPage />} />
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} />
    </Route>
  )
}
