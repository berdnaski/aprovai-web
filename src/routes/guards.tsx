import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom"

import { useMyCompany } from "@/hooks/companies/use-companies"
import { CompanyMemberRole } from "@/types/enums"
import { appHomeFor, safeRedirect } from "@/routes/destinations"
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
  return user?.isSuperAdmin ? "/plataforma" : "/entrando"
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
  const { membership } = useSession()

  if (companyQuery.isLoading) {
    return <FullScreenLoader />
  }

  if (companyQuery.data && !companyQuery.data.onboardingCompletedAt) {
    // Só quem administra o financeiro consegue concluir a configuração.
    // Quem entrou por convite espera, em vez de cair num assistente que
    // não tem permissão para terminar.
    return (
      <Navigate
        to={
          membership?.role === CompanyMemberRole.FINANCE_ADMIN
            ? "/onboarding"
            : "/empresa-em-configuracao"
        }
        replace
      />
    )
  }

  return <Outlet />
}

export function RedirectIfAuthenticated() {
  const [searchParams] = useSearchParams()
  const { isAuthenticated, membership, user, isLoading } = useSession()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (isAuthenticated) {
    const redirect = safeRedirect(searchParams.get("redirect"))

    return (
      <Navigate
        to={
          redirect ??
          (membership
            ? appHomeFor(membership.role)
            : landingWithoutCompany(user))
        }
        replace
      />
    )
  }

  return <Outlet />
}
