import { Check, Info, WarningCircle, X } from "@phosphor-icons/react"
import { useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"

import { getApiErrorMessage } from "@/api/client"
import type { EmailDecision } from "@/api/email-approvals"
import logo from "@/assets/aprovai.svg"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { MoneyDisplay } from "@/components/shared/money-display"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDecideByEmail,
  useEmailApproval,
} from "@/hooks/email-approvals/use-email-approval"
import { REQUEST_STATUS } from "@/lib/status-labels"
import { cn } from "@/lib/utils"

const MIN_JUSTIFICATION = 10

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background px-4 py-8 sm:py-14">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <img src={logo} alt="AprovAI" className="h-6 w-auto self-center" />
        {children}
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-xs">
      {children}
    </div>
  )
}

function Summary({
  number,
  title,
  totalAmountCents,
  requesterName,
}: {
  number: string
  title: string
  totalAmountCents: string
  requesterName: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-micro tabular-nums text-muted-foreground/70">
          {number}
        </p>
        <h1 className="mt-0.5 text-heading text-foreground">{title}</h1>
      </div>

      <dl className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-md border border-border">
        <div className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
          <dt className="text-caption text-muted-foreground">Valor total</dt>
          <dd>
            <MoneyDisplay
              cents={totalAmountCents}
              emphasis
              className="text-body"
            />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
          <dt className="text-caption text-muted-foreground">Quem pediu</dt>
          <dd className="text-caption text-foreground">{requesterName}</dd>
        </div>
      </dl>
    </div>
  )
}

export function EmailApprovalPage() {
  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()

  const wanted = searchParams.get("decisao")
  const [choice, setChoice] = useState<EmailDecision | null>(
    wanted === "aprovar" ? "APPROVED" : wanted === "rejeitar" ? "REJECTED" : null,
  )
  const [justification, setJustification] = useState("")
  const [done, setDone] = useState<EmailDecision | null>(null)

  const approvalQuery = useEmailApproval(token)
  const decide = useDecideByEmail(token)

  if (approvalQuery.isPending) {
    return (
      <Shell>
        <Card>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </Shell>
    )
  }

  if (approvalQuery.isError || !approvalQuery.data) {
    return (
      <Shell>
        <Card>
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <WarningCircle size={20} />
            </span>
            <h1 className="text-heading text-foreground">Link inválido</h1>
            <p className="text-caption leading-relaxed text-muted-foreground">
              {getApiErrorMessage(approvalQuery.error)}
            </p>
            <p className="text-caption leading-relaxed text-muted-foreground">
              Links de aprovação valem por tempo limitado e só podem ser usados
              uma vez. Entre no AprovAI para decidir por lá.
            </p>
          </div>
        </Card>
      </Shell>
    )
  }

  const approval = approvalQuery.data

  if (done) {
    return (
      <Shell>
        <Card>
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              aria-hidden
              className={cn(
                "flex size-11 items-center justify-center rounded-full",
                done === "APPROVED"
                  ? "bg-brand-accent/10 text-brand-accent-strong"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {done === "APPROVED" ? (
                <ApprovalMark className="size-5" />
              ) : (
                <X size={20} weight="bold" />
              )}
            </span>

            <h1 className="text-heading text-foreground">
              {done === "APPROVED" ? "Pedido aprovado" : "Pedido recusado"}
            </h1>
            <p className="text-caption leading-relaxed text-muted-foreground">
              Sua decisão sobre {approval.number} foi registrada. Quem pediu já
              foi avisado. Pode fechar esta página.
            </p>
          </div>
        </Card>
      </Shell>
    )
  }

  if (!approval.actionable) {
    return (
      <Shell>
        <Card>
          <Summary
            number={approval.number}
            title={approval.title}
            totalAmountCents={approval.totalAmountCents}
            requesterName={approval.requesterName}
          />

          <div className="flex items-start gap-2.5 rounded-md border border-border bg-muted/40 px-3.5 py-3">
            <Info
              size={15}
              aria-hidden
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
            <div className="min-w-0">
              <p className="text-caption leading-relaxed text-foreground">
                {approval.reason ??
                  "Este pedido não está mais aguardando a sua decisão."}
              </p>
              <p className="mt-1.5">
                <StatusBadge map={REQUEST_STATUS} value={approval.status} />
              </p>
            </div>
          </div>
        </Card>
      </Shell>
    )
  }

  const needsJustification = choice === "REJECTED"
  const tooShort =
    needsJustification && justification.trim().length < MIN_JUSTIFICATION

  function submit() {
    if (!choice || tooShort) {
      return
    }

    decide.mutate(
      {
        type: choice,
        ...(justification.trim() ? { justification: justification.trim() } : {}),
      },
      { onSuccess: () => setDone(choice) },
    )
  }

  return (
    <Shell>
      <Card>
        <Summary
          number={approval.number}
          title={approval.title}
          totalAmountCents={approval.totalAmountCents}
          requesterName={approval.requesterName}
        />

        {choice === null ? (
          <div className="flex flex-col gap-2">
            <p className="text-caption text-muted-foreground">
              Você é o aprovador desta etapa.
            </p>

            <Button
              size="lg"
              onClick={() => setChoice("APPROVED")}
              className="h-11 w-full gap-2 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <Check size={16} weight="bold" aria-hidden />
              Aprovar
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setChoice("REJECTED")}
              className="h-11 w-full gap-2 font-medium"
            >
              <X size={16} weight="bold" aria-hidden />
              Recusar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-caption leading-relaxed text-foreground">
              {choice === "APPROVED"
                ? "Confirma a aprovação deste pedido?"
                : "Confirma a recusa deste pedido?"}
            </p>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="justificativa"
                className="flex items-baseline gap-2 text-label text-foreground"
              >
                Justificativa
                {!needsJustification ? (
                  <span className="text-caption font-normal text-muted-foreground">
                    opcional
                  </span>
                ) : null}
              </label>
              <textarea
                id="justificativa"
                value={justification}
                onChange={(event) => setJustification(event.target.value)}
                rows={3}
                aria-invalid={tooShort || undefined}
                placeholder={
                  needsJustification
                    ? "Explique para quem pediu por que não vai adiante."
                    : "Um comentário para quem pediu."
                }
                className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
              {needsJustification ? (
                <p className="text-caption text-muted-foreground">
                  Mínimo de {MIN_JUSTIFICATION} caracteres.
                </p>
              ) : null}
            </div>

            {decide.isError ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-caption leading-relaxed text-foreground"
              >
                {getApiErrorMessage(decide.error)}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                disabled={tooShort || decide.isPending}
                onClick={submit}
                className={cn(
                  "h-11 w-full font-medium",
                  choice === "APPROVED"
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                )}
              >
                {decide.isPending
                  ? "Registrando…"
                  : choice === "APPROVED"
                    ? "Confirmar aprovação"
                    : "Confirmar recusa"}
              </Button>

              <Button
                size="lg"
                variant="ghost"
                disabled={decide.isPending}
                onClick={() => {
                  setChoice(null)
                  setJustification("")
                }}
                className="w-full font-medium text-muted-foreground"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}
      </Card>

      <p className="text-center text-caption text-muted-foreground">
        Decidindo como{" "}
        <span className="font-medium text-foreground">
          {approval.approverName}
        </span>
      </p>
    </Shell>
  )
}
