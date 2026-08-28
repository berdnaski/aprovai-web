import { ArrowRight, Buildings, SealCheck, WarningCircle } from "@phosphor-icons/react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogout } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"
import {
  useAcceptInvite,
  useInvitePreview,
} from "@/hooks/invites/use-invite-token"
import { AuthLayout } from "@/features/auth/auth-layout"
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/types/enums"
import type { CompanyMemberRole } from "@/types/enums"

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-xs">
      {children}
    </div>
  )
}

function InviteSummary({
  companyName,
  role,
}: {
  companyName: string
  role: CompanyMemberRole
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary"
        >
          <Buildings size={19} />
        </span>

        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-foreground">
            {companyName}
          </p>
          <p className="text-caption text-muted-foreground">
            convidou você para o AprovAI
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/40 px-3.5 py-3">
        <p className="text-overline text-muted-foreground/70">Seu perfil</p>
        <p className="mt-1 text-body font-medium text-foreground">
          {ROLE_LABELS[role]}
        </p>
        <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
          {ROLE_DESCRIPTIONS[role]}
        </p>
      </div>
    </div>
  )
}

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const { user, isAuthenticated, isLoading } = useSession()
  const previewQuery = useInvitePreview(token)
  const accept = useAcceptInvite()
  const logout = useLogout()

  const { pathname } = useLocation()
  const returnTo = encodeURIComponent(pathname)

  if (isLoading || previewQuery.isPending) {
    return (
      <AuthLayout title="Convite">
        <Panel>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-9 w-full" />
        </Panel>
      </AuthLayout>
    )
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <AuthLayout
        title="Convite indisponível"
        description={getApiErrorMessage(previewQuery.error)}
      >
        <Panel>
          <p className="flex items-start gap-2 text-caption leading-relaxed text-muted-foreground">
            <WarningCircle
              size={15}
              aria-hidden
              className="mt-px shrink-0 text-destructive"
            />
            Convites valem por tempo limitado e só podem ser usados uma vez. Peça
            um novo para quem administra a empresa.
          </p>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/entrar")}
            className="w-full font-medium"
          >
            Ir para o login
          </Button>
        </Panel>
      </AuthLayout>
    )
  }

  const invite = previewQuery.data
  const mismatch = isAuthenticated && user?.email !== invite.email

  if (!isAuthenticated) {
    return (
      <AuthLayout title="Você foi convidado">
        <Panel>
          <InviteSummary companyName={invite.companyName} role={invite.role} />

          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              onClick={() => navigate(`/registrar?redirect=${returnTo}`)}
              className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Criar conta
              <ArrowRight size={14} weight="bold" aria-hidden />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/entrar?redirect=${returnTo}`)}
              className="w-full font-medium"
            >
              Já tenho conta
            </Button>
          </div>

          <p className="text-caption leading-relaxed text-muted-foreground">
            Use o e-mail{" "}
            <span className="font-medium text-foreground">{invite.email}</span> —
            é para ele que o convite foi emitido.
          </p>
        </Panel>
      </AuthLayout>
    )
  }

  if (mismatch) {
    return (
      <AuthLayout title="Convite de outro e-mail">
        <Panel>
          <InviteSummary companyName={invite.companyName} role={invite.role} />

          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-warning/25 bg-warning/[0.07] px-3.5 py-3"
          >
            <WarningCircle
              size={15}
              aria-hidden
              className="mt-px shrink-0 text-warning-strong"
            />
            <p className="text-caption leading-relaxed text-foreground">
              Este convite foi enviado para{" "}
              <span className="font-medium">{invite.email}</span>, mas você está
              conectado como{" "}
              <span className="font-medium">{user?.email}</span>.
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => navigate(`/entrar?redirect=${returnTo}`),
              })
            }
            className="w-full font-medium"
          >
            {logout.isPending ? "Saindo…" : "Sair e entrar com o outro e-mail"}
          </Button>
        </Panel>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Você foi convidado">
      <Panel>
        <InviteSummary companyName={invite.companyName} role={invite.role} />

        <Button
          size="lg"
          disabled={accept.isPending || !token}
          onClick={() =>
            accept.mutate(token as string, {
              onSuccess: () => {
                toast.success(`Bem-vindo à ${invite.companyName}.`)
                navigate("/", { replace: true })
              },
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }
          className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {accept.isPending ? (
            "Entrando…"
          ) : (
            <>
              <ApprovalMark className="size-3.5" />
              Aceitar convite
            </>
          )}
        </Button>

        <p className="flex items-start gap-2 text-caption leading-relaxed text-muted-foreground">
          <SealCheck size={14} aria-hidden className="mt-px shrink-0" />
          Você entra como{" "}
          <span className="font-medium text-foreground">{user?.email}</span>.
        </p>
      </Panel>
    </AuthLayout>
  )
}
