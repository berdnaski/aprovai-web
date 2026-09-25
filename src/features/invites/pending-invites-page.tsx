import { ArrowRight, Buildings } from "@phosphor-icons/react"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthLayout } from "@/features/auth/auth-layout"
import {
  useAcceptPendingInvite,
  useMyPendingInvites,
} from "@/hooks/invites/use-invite-token"
import { useSession } from "@/hooks/auth/use-session"
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/types/enums"

export function PendingInvitesPage() {
  const navigate = useNavigate()
  const { membership } = useSession()
  const invitesQuery = useMyPendingInvites(!membership)
  const accept = useAcceptPendingInvite()

  if (membership) {
    return <Navigate to="/" replace />
  }

  if (invitesQuery.isPending) {
    return (
      <AuthLayout title="Um instante">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </AuthLayout>
    )
  }

  const invites = invitesQuery.data ?? []

  if (invites.length === 0) {
    return <Navigate to="/onboarding/empresa" replace />
  }

  return (
    <AuthLayout
      title={invites.length === 1 ? "Você foi convidado" : "Seus convites"}
      description="Aceite para entrar na empresa. Você não precisa criar uma."
    >
      <div className="flex flex-col gap-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary"
              >
                <Buildings size={19} />
              </span>

              <div className="min-w-0">
                <p className="truncate text-body font-semibold text-foreground">
                  {invite.companyName}
                </p>
                <p className="text-caption text-muted-foreground">
                  como {ROLE_LABELS[invite.role]}
                </p>
              </div>
            </div>

            <p className="text-caption leading-relaxed text-muted-foreground">
              {ROLE_DESCRIPTIONS[invite.role]}
            </p>

            <Button
              size="lg"
              disabled={accept.isPending}
              onClick={() =>
                accept.mutate(invite.id, {
                  onSuccess: () => {
                    toast.success(`Bem-vindo à ${invite.companyName}.`)
                    navigate("/", { replace: true })
                  },
                  onError: (error) => toast.error(getApiErrorMessage(error)),
                })
              }
              className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {accept.isPending ? "Entrando…" : "Aceitar convite"}
              <ArrowRight size={14} weight="bold" aria-hidden />
            </Button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => navigate("/onboarding/empresa")}
          className="rounded-md px-2 py-1 text-center text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Prefiro criar minha própria empresa
        </button>
      </div>
    </AuthLayout>
  )
}
