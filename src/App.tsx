import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { setUnauthorizedHandler } from "@/api/client"
import { Toaster } from "@/components/ui/sonner"
import { authKeys } from "@/hooks/auth/use-session"
import { appRoutes } from "@/routes/app-routes"
import {
  RequireAuth,
  RequireCompany,
  RequireOnboarding,
} from "@/routes/guards"
import {
  createCompanyRoutes,
  onboardingRoutes,
} from "@/routes/onboarding-routes"
import { guestRoutes, tokenRoutes } from "@/routes/public-routes"

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
          {tokenRoutes()}
          {guestRoutes()}

          <Route element={<RequireAuth />}>
            {createCompanyRoutes()}

            <Route element={<RequireCompany />}>
              {onboardingRoutes()}

              <Route element={<RequireOnboarding />}>{appRoutes()}</Route>
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
