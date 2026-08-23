import { ArrowClockwise, EnvelopeSimple, X } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Invite } from "@/api/invites"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useResendInvite, useRevokeInvite } from "@/hooks/members/use-members"
import { INVITE_STATUS } from "@/lib/status-labels"
import { InviteStatus, ROLE_LABELS } from "@/types/enums"

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
})

export function InvitesPanel({
  invites,
  isPending,
  inviteAction,
}: {
  invites: Invite[]
  isPending: boolean
  inviteAction: React.ReactNode
}) {
  const [revoking, setRevoking] = useState<Invite | null>(null)

  const resend = useResendInvite()
  const revoke = useRevokeInvite()

  if (isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy>
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const pending = invites.filter(
    (invite) => invite.status === InviteStatus.PENDING,
  )
  const closed = invites.filter(
    (invite) => invite.status !== InviteStatus.PENDING,
  )

  if (invites.length === 0) {
    return (
      <EmptyState
        icon={EnvelopeSimple}
        title="Nenhum convite enviado"
        description="Convide alguém para a empresa e o convite pendente aparece aqui até ser aceito."
        action={inviteAction}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 ? (
        <section
          aria-label="Convites aguardando resposta"
          className="rise-in overflow-hidden rounded-lg border border-border bg-card"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-3.5">
            <h3 className="text-label text-foreground">
              Aguardando resposta
              <span className="ml-2 text-caption font-normal text-muted-foreground tabular-nums">
                {pending.length}
              </span>
            </h3>
            <p className="text-caption text-muted-foreground">
              a pessoa entra na empresa assim que aceitar
            </p>
          </header>

          <ul className="divide-y divide-border/60">
            {pending.map((invite) => (
              <li key={invite.id}>
                <div className="group/invite flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  >
                    <EnvelopeSimple size={15} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body text-foreground">
                      {invite.email}
                    </p>
                    <p className="truncate text-caption text-muted-foreground">
                      {ROLE_LABELS[invite.role]}
                      <span aria-hidden className="px-1.5 text-border">
                        /
                      </span>
                      enviado em {DATE.format(new Date(invite.createdAt))}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/invite:opacity-100 focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={resend.isPending}
                      onClick={() =>
                        resend.mutate(invite.id, {
                          onSuccess: () =>
                            toast.success(`Convite reenviado para ${invite.email}.`),
                          onError: (error) =>
                            toast.error(getApiErrorMessage(error)),
                        })
                      }
                      className="gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowClockwise size={13} aria-hidden />
                      Reenviar
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Cancelar convite de ${invite.email}`}
                      onClick={() => setRevoking(invite)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {closed.length > 0 ? (
        <section
          aria-label="Convites encerrados"
          className="rise-in overflow-hidden rounded-lg border border-border bg-card [animation-delay:80ms]"
        >
          <header className="border-b border-border px-5 py-3.5">
            <h3 className="text-label text-foreground">Encerrados</h3>
          </header>

          <ul className="divide-y divide-border/60">
            {closed.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center gap-3 px-5 py-2.5"
              >
                <p className="min-w-0 flex-1 truncate text-body text-muted-foreground">
                  {invite.email}
                </p>
                <span className="shrink-0 text-caption text-muted-foreground">
                  {ROLE_LABELS[invite.role]}
                </span>
                <StatusBadge map={INVITE_STATUS} value={invite.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(next) => {
          if (!next) {
            setRevoking(null)
          }
        }}
        title={`Cancelar o convite de ${revoking?.email ?? ""}?`}
        description="O link enviado deixa de funcionar. Você pode convidar a mesma pessoa de novo depois."
        confirmLabel={revoke.isPending ? "Cancelando…" : "Cancelar convite"}
        cancelLabel="Manter convite"
        isPending={revoke.isPending}
        onConfirm={() => {
          if (!revoking) {
            return
          }

          revoke.mutate(revoking.id, {
            onSuccess: () => {
              toast.success(`Convite de ${revoking.email} cancelado.`)
              setRevoking(null)
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }}
      />
    </div>
  )
}
