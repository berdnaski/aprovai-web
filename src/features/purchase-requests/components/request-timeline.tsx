import {
  ArrowBendRightUp,
  Check,
  Clock,
  Envelope,
  Prohibit,
  X,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"

import type { RequestTimeline, TimelineStep } from "@/api/purchase-requests"
import { StatusPill } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"
import { DECISION_TYPE, STEP_STATUS } from "@/lib/status-labels"
import { DecisionChannel, StepStatus } from "@/types/enums"

const STEP_ICON: Record<StepStatus, Icon> = {
  WAITING: Clock,
  APPROVED: Check,
  REJECTED: X,
  ESCALATED: ArrowBendRightUp,
  CANCELED: Prohibit,
}

const NODE_TONE: Record<StepStatus, string> = {
  WAITING: "border-primary bg-card text-primary",
  APPROVED: "border-brand-accent bg-brand-accent text-brand-accent-foreground",
  REJECTED: "border-destructive bg-destructive text-destructive-foreground",
  ESCALATED: "border-warning bg-warning text-primary-foreground",
  CANCELED: "border-border bg-muted text-muted-foreground",
}

function when(value: string | null): string {
  if (!value) {
    return ""
  }

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function Step({ step, last }: { step: TimelineStep; last: boolean }) {
  const StepIcon = STEP_ICON[step.status]

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className="absolute top-7 bottom-0 left-3.5 w-px -translate-x-1/2 bg-border"
        />
      ) : null}

      <span
        aria-hidden
        className={cn(
          "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border",
          NODE_TONE[step.status],
        )}
      >
        <StepIcon size={13} weight="bold" />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-caption font-medium text-foreground">
            {step.expectedApproverName}
          </span>

          <StatusPill
            tone={
              step.status === StepStatus.APPROVED
                ? "success"
                : step.status === StepStatus.REJECTED
                  ? "danger"
                  : step.status === StepStatus.ESCALATED
                    ? "warning"
                    : step.status === StepStatus.WAITING
                      ? "brand"
                      : "neutral"
            }
          >
            {STEP_STATUS[step.status].label}
          </StatusPill>

          {step.requiresDualApproval ? (
            <StatusPill tone="brand">2 assinaturas</StatusPill>
          ) : null}

          {step.isCurrent ? (
            <span className="text-micro text-primary">etapa atual</span>
          ) : null}
        </div>

        {step.escalatedFromName ? (
          <p className="mt-1 text-caption text-warning-strong">
            Escalou de {step.escalatedFromName} em {when(step.escalatedAt)}
          </p>
        ) : null}

        {step.decisions.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-2">
            {step.decisions.map((decision) => (
              <li
                key={decision.id}
                className="rounded-md border border-border/70 bg-muted/30 px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-caption font-medium text-foreground">
                    {DECISION_TYPE[decision.type].label}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    por {decision.actor}
                  </span>
                  {decision.channel === DecisionChannel.EMAIL ? (
                    <Envelope
                      size={12}
                      aria-label="Decidido por e-mail"
                      className="text-muted-foreground"
                    />
                  ) : null}
                  <span className="ml-auto text-micro tabular-nums text-muted-foreground/70">
                    {when(decision.decidedAt)}
                  </span>
                </div>

                {decision.justification ? (
                  <p className="mt-1 text-caption leading-relaxed text-muted-foreground">
                    {decision.justification}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : step.startedAt ? (
          <p className="mt-1 text-micro tabular-nums text-muted-foreground/70">
            Aguardando desde {when(step.startedAt)}
          </p>
        ) : null}
      </div>
    </li>
  )
}

export function RequestTimelineView({
  timeline,
  compact = false,
}: {
  timeline: RequestTimeline
  compact?: boolean
}) {
  const steps = compact
    ? timeline.steps.filter(
        (step) => step.isCurrent || step.decisions.length > 0,
      )
    : timeline.steps

  return (
    <div className="flex flex-col gap-4">
      {!compact ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground">
          <span>Criado em {when(timeline.createdAt)}</span>
          {timeline.submittedAt ? (
            <span>Enviado em {when(timeline.submittedAt)}</span>
          ) : null}
          {timeline.finalizedAt ? (
            <span>Finalizado em {when(timeline.finalizedAt)}</span>
          ) : null}
        </div>
      ) : null}

      {steps.length === 0 ? (
        <p className="text-caption leading-relaxed text-muted-foreground">
          A rota de aprovação só é montada quando o pedido é enviado.
        </p>
      ) : (
        <ol className="flex flex-col">
          {steps.map((step, index) => (
            <Step
              key={step.order}
              step={step}
              last={index === steps.length - 1}
            />
          ))}
        </ol>
      )}

      {timeline.cancelReason ? (
        <p className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-caption leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">
            Motivo do cancelamento:
          </span>{" "}
          {timeline.cancelReason}
        </p>
      ) : null}
    </div>
  )
}
