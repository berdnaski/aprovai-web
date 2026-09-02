import {
  ArrowBendRightUp,
  Check,
  Clock,
  Envelope,
  FileText,
  PaperPlaneTilt,
  Prohibit,
  X,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"

import type { RequestTimeline, TimelineStep } from "@/api/purchase-requests"
import { initialsOf } from "@/lib/people"
import { DECISION_TYPE } from "@/lib/status-labels"
import { cn } from "@/lib/utils"
import { DecisionChannel, StepStatus } from "@/types/enums"

const STEP_ICON: Record<StepStatus, Icon> = {
  WAITING: Clock,
  APPROVED: Check,
  REJECTED: X,
  ESCALATED: ArrowBendRightUp,
  CANCELED: Prohibit,
}

const NODE_TONE: Record<StepStatus, string> = {
  WAITING: "border-primary/40 bg-primary/8 text-primary",
  APPROVED: "border-brand-accent bg-brand-accent text-white",
  REJECTED: "border-destructive bg-destructive text-white",
  ESCALATED: "border-warning bg-warning text-white",
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

function Rail({ last }: { last: boolean }) {
  if (last) {
    return null
  }

  return (
    <span
      aria-hidden
      className="absolute top-8 bottom-0 left-4 w-px -translate-x-1/2 bg-border"
    />
  )
}

function Marker({
  icon: MarkerIcon,
  label,
  at,
  last = false,
}: {
  icon: Icon
  label: string
  at: string | null
  last?: boolean
}) {
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <Rail last={last} />

      <span
        aria-hidden
        className="relative z-10 flex size-8 shrink-0 self-start items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
      >
        <MarkerIcon size={14} />
      </span>

      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1.5">
        <span className="text-caption text-muted-foreground">{label}</span>
        <span className="text-micro tabular-nums text-muted-foreground/70">
          {when(at)}
        </span>
      </div>
    </li>
  )
}

function Step({ step, last }: { step: TimelineStep; last: boolean }) {
  const StepIcon = STEP_ICON[step.status]
  const nome = step.expectedApproverName

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <Rail last={last} />

      <span className="relative z-10 size-8 shrink-0 self-start">
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-[11px] leading-none font-semibold text-muted-foreground"
        >
          {initialsOf(nome)}
        </span>

        <span
          aria-hidden
          className={cn(
            "absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border-2 border-card",
            NODE_TONE[step.status],
          )}
        >
          <StepIcon size={8} weight="bold" />
        </span>
      </span>

      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-caption font-medium text-foreground">
            {nome}
          </span>

          {step.isCurrent ? (
            <span className="rounded bg-primary/10 px-1.5 text-micro font-medium text-primary">
              decide agora
            </span>
          ) : null}

          {step.requiresDualApproval ? (
            <span className="rounded bg-muted px-1.5 text-micro text-muted-foreground">
              2 assinaturas
            </span>
          ) : null}
        </div>

        {step.escalatedFromName ? (
          <p className="mt-0.5 text-micro text-warning-strong">
            escalou de {step.escalatedFromName} · {when(step.escalatedAt)}
          </p>
        ) : null}

        {step.decisions.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1.5">
            {step.decisions.map((decision) => (
              <li key={decision.id} className="flex flex-col gap-1">
                <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  <span
                    className={cn(
                      "text-caption font-medium",
                      step.status === StepStatus.REJECTED
                        ? "text-destructive"
                        : "text-brand-accent-strong",
                    )}
                  >
                    {DECISION_TYPE[decision.type].label}
                  </span>

                  {decision.channel === DecisionChannel.EMAIL ? (
                    <Envelope
                      size={11}
                      aria-label="Decidido por e-mail"
                      className="text-muted-foreground"
                    />
                  ) : null}

                  <span className="text-micro tabular-nums text-muted-foreground/70">
                    {when(decision.decidedAt)}
                  </span>
                </p>

                {decision.justification ? (
                  <p className="border-l-2 border-border pl-3 text-caption leading-relaxed text-muted-foreground">
                    {decision.justification}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : step.startedAt ? (
          <p className="mt-0.5 text-micro tabular-nums text-muted-foreground/70">
            aguardando desde {when(step.startedAt)}
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

  if (compact) {
    return (
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <Step
            key={step.order}
            step={step}
            last={index === steps.length - 1}
          />
        ))}
      </ol>
    )
  }

  const hasSteps = steps.length > 0

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col">
        <Marker
          icon={FileText}
          label="Pedido criado"
          at={timeline.createdAt}
          last={!timeline.submittedAt && !hasSteps}
        />

        {timeline.submittedAt ? (
          <Marker
            icon={PaperPlaneTilt}
            label="Enviado para aprovação"
            at={timeline.submittedAt}
            last={!hasSteps}
          />
        ) : null}

        {steps.map((step, index) => (
          <Step
            key={step.order}
            step={step}
            last={index === steps.length - 1 && !timeline.finalizedAt}
          />
        ))}

        {timeline.finalizedAt ? (
          <Marker
            icon={Check}
            label="Finalizado"
            at={timeline.finalizedAt}
            last
          />
        ) : null}
      </ol>

      {!hasSteps ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-caption leading-relaxed text-muted-foreground">
          A rota de aprovação é montada quando o pedido for enviado.
        </p>
      ) : null}

      {timeline.cancelReason ? (
        <p className="rounded-lg border border-destructive/25 bg-destructive/4 px-4 py-3 text-caption leading-relaxed text-muted-foreground">
          <span className="font-medium text-destructive">
            Motivo do cancelamento
          </span>
          <br />
          {timeline.cancelReason}
        </p>
      ) : null}
    </div>
  )
}
