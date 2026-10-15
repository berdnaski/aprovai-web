import { ArrowClockwise, SignOut } from "@phosphor-icons/react"

import logo from "@/assets/aprovai.svg"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"
import { useMyCompany } from "@/hooks/companies/use-companies"
import { ROLE_LABELS } from "@/types/enums"

export function CompanySetupPendingPage() {
  const { user, membership } = useSession()
  const companyQuery = useMyCompany()
  const logoutMutation = useLogout()

  const company = companyQuery.data
  const companyName = company?.tradeName ?? company?.legalName

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <img src={logo} alt="AprovAI" className="h-6 w-auto" />

          <div className="flex items-center gap-3">
            {user ? (
              <span className="hidden text-label font-normal text-muted-foreground sm:inline">
                {user.email}
              </span>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-label font-normal text-muted-foreground hover:text-foreground"
            >
              <SignOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">
        <h1 className="text-display text-balance text-foreground">
          {companyName
            ? `A ${companyName} ainda está sendo configurada`
            : "Sua empresa ainda está sendo configurada"}
        </h1>

        <p className="mt-3 text-subhead leading-relaxed text-muted-foreground">
          Quem administra o financeiro precisa terminar de definir os Centros
          de Custo e as regras de aprovação. Até lá, não dá para abrir pedidos.
        </p>

        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-caption text-muted-foreground">
              Você entrou como
            </span>
            <span className="text-caption font-medium text-foreground">
              {membership ? ROLE_LABELS[membership.role] : "—"}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-4 border-t border-border/60 pt-3">
            <span className="text-caption text-muted-foreground">E-mail</span>
            <span className="min-w-0 truncate text-caption font-medium text-foreground">
              {user?.email ?? "—"}
            </span>
          </div>
        </div>

        <p className="mt-6 text-caption leading-relaxed text-muted-foreground">
          Assim que a configuração terminar, seu acesso abre sozinho — é só
          recarregar esta página.
        </p>

        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => void companyQuery.refetch()}
            disabled={companyQuery.isFetching}
            className="h-11 gap-2 font-medium"
          >
            <ArrowClockwise
              size={15}
              aria-hidden
              className={companyQuery.isFetching ? "animate-spin" : undefined}
            />
            {companyQuery.isFetching ? "Verificando…" : "Verificar de novo"}
          </Button>
        </div>
      </main>
    </div>
  )
}
