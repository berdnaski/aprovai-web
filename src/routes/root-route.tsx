import { Navigate } from "react-router-dom"

import { LandingPage } from "@/features/marketing/landing-page"
import { useSession } from "@/hooks/auth/use-session"
import { APP_HOME } from "@/routes/destinations"

export function RootRoute() {
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) {
    return (
      <div
        className="flex min-h-svh items-center justify-center bg-background"
        role="status"
        aria-label="Carregando"
      >
        <span className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={APP_HOME} replace />
  }

  return <LandingPage />
}
