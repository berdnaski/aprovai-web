import { ArrowLeft, Buildings, Stack } from "@phosphor-icons/react"
import { useEffect } from "react"
import { Link, NavLink, Navigate, Outlet } from "react-router-dom"
import { toast } from "sonner"

import { useLogout } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { to: "/plataforma/organizacoes", label: "Organizações", icon: Buildings },
  { to: "/plataforma/planos", label: "Planos comerciais", icon: Stack },
] as const

export function PlatformLayout() {
  const { user, membership, isLoading } = useSession()
  const logout = useLogout()

  const denied = !isLoading && !user?.isSuperAdmin

  useEffect(() => {
    if (denied) {
      toast.error(
        "Esta área é restrita à administração da plataforma. Faça login de novo se sua conta acabou de virar SuperAdmin.",
      )
    }
  }, [denied])

  if (isLoading) {
    return (
      <div
        className="flex min-h-svh items-center justify-center bg-background"
        aria-busy
      >
        <span className="text-caption text-muted-foreground">Carregando…</span>
      </div>
    )
  }

  if (denied || !user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
        {membership ? (
          <>
            <Link
              to="/"
              className="flex shrink-0 items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ArrowLeft size={13} aria-hidden />
              <span className="hidden sm:inline">Voltar à empresa</span>
              <span className="sm:hidden">Voltar</span>
            </Link>

            <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
          </>
        ) : null}

        <p className="flex min-w-0 items-center gap-2">
          <span className="truncate text-label text-foreground">
            Administração da plataforma
          </span>
          <span className="hidden shrink-0 rounded border border-border bg-muted px-1.5 text-micro text-muted-foreground sm:inline">
            SuperAdmin
          </span>
        </p>

        <div className="ml-auto flex min-w-0 items-center gap-3">
          <span className="hidden truncate text-caption text-muted-foreground sm:block">
            {user.email}
          </span>

          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="shrink-0 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        <nav
          aria-label="Seções da plataforma"
          className="flex gap-1 border-b border-border px-4 lg:px-6"
        >
          {SECTIONS.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex items-center gap-1.5 border-b-2 px-2 py-2.5 text-caption transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isActive
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )
              }
            >
              <section.icon size={14} aria-hidden />
              {section.label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
