import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useMyCompany } from "@/hooks/companies/use-companies"
import { APP_HOME } from "@/routes/destinations"
import { useSession } from "@/hooks/auth/use-session"

function FullScreenLoader() {
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

function landingWithoutCompany(user: { isSuperAdmin?: boolean } | null) {
  return user?.isSuperAdmin ? "/plataforma" : "/onboarding/empresa"
}

export function RequireAuth() {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/entrar?redirect=${redirect}`} replace />
  }

  return <Outlet />
}

export function RequireCompany() {
  const { user, membership } = useSession()

  if (!membership) {
    return <Navigate to={landingWithoutCompany(user)} replace />
  }

  return <Outlet />
}

export function RequireNoCompany() {
  const { membership } = useSession()

  if (membership) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

export function RequireOnboarding() {
  const companyQuery = useMyCompany()

  if (companyQuery.isLoading) {
    return <FullScreenLoader />
  }

  if (companyQuery.data && !companyQuery.data.onboardingCompletedAt) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

export function RedirectIfAuthenticated() {
  const { isAuthenticated, membership, user, isLoading } = useSession()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (isAuthenticated) {
    return (
      <Navigate to={membership ? APP_HOME : landingWithoutCompany(user)} replace />
    )
  }

  return <Outlet />
}
