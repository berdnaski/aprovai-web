import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { setUnauthorizedHandler } from "@/api/client"
import { AppLayout } from "@/components/layout/app-layout"
import { authKeys } from "@/hooks/auth/use-session"
import { Toaster } from "@/components/ui/sonner"
import { ChangePasswordPage } from "@/features/account/change-password-page"
import { ConfirmPasswordChangePage } from "@/features/auth/confirm-password-change-page"
import { ForgotPasswordPage } from "@/features/auth/forgot-password-page"
import { LoginPage } from "@/features/auth/login-page"
import { RegisterPage } from "@/features/auth/register-page"
import { ResetPasswordPage } from "@/features/auth/reset-password-page"
import { VerifyEmailPage } from "@/features/auth/verify-email-page"
import { HomePage } from "@/features/home/home-page"
import { CreateCompanyPage } from "@/features/onboarding/create-company-page"
import { OnboardingPage } from "@/features/onboarding/onboarding-page"
import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequireCompany,
  RequireNoCompany,
  RequireOnboarding,
} from "@/routes/guards"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
})

setUnauthorizedHandler(() => {
  queryClient.setQueryData(authKeys.session, null)
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/confirm-password-change"
            element={<ConfirmPasswordChangePage />}
          />

          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/registrar" element={<RegisterPage />} />
            <Route path="/entrar" element={<LoginPage />} />
            <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<RequireNoCompany />}>
              <Route
                path="/onboarding/empresa"
                element={<CreateCompanyPage />}
              />
            </Route>

            <Route element={<RequireCompany />}>
              <Route path="/onboarding" element={<OnboardingPage />} />

              <Route element={<RequireOnboarding />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/conta/senha" element={<ChangePasswordPage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
