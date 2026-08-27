import { UserSwitch } from "@phosphor-icons/react"

import type { SimulatedStep } from "@/api/approval-rules"
import type { Member } from "@/api/members"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { StatusPill } from "@/components/ui/data-table"
import { formatCents } from "@/lib/money"
import { displayName, initialsOf } from "@/lib/people"
import { cn } from "@/lib/utils"
import { ROLE_LABELS } from "@/types/enums"

function Node({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "success"
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute top-3 left-0 flex size-6 items-center justify-center rounded-full border text-micro tabular-nums",
        tone === "success"
          ? "border-brand-accent/30 bg-brand-accent/10 text-brand-accent-strong"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </span>
  )
}

export function ApprovalChain({
  steps,
  members,
  className,
}: {
  steps: SimulatedStep[]
  members: Map<string, Member>
  className?: string
}) {
  return (
    <ol className={cn("relative flex flex-col", className)}>
      <span
        aria-hidden
        className="absolute top-6 bottom-6 left-3 w-px -translate-x-1/2 bg-border"
      />

      {steps.map((step) => {
        const approver = members.get(step.expectedApproverId)
        const covering = step.onBehalfOfId
          ? members.get(step.onBehalfOfId)
          : undefined
        const name = displayName(approver)

        return (
          <li key={step.stepOrder} className="relative py-3 pl-9">
            <Node>{step.stepOrder}</Node>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-micro text-muted-foreground"
              >
                {initialsOf(name)}
              </span>

              <span className="text-caption font-medium text-foreground">
                {name}
              </span>

              {approver ? (
                <span className="text-caption text-muted-foreground">
                  {ROLE_LABELS[approver.role]} · alçada de{" "}
                  <span className="tabular-nums">
                    {formatCents(approver.approvalLimitCents)}
                  </span>
                </span>
              ) : null}

              {step.requiresDualApproval ? (
                <StatusPill tone="brand">2 assinaturas</StatusPill>
              ) : null}
            </div>

            {covering ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-caption text-warning-strong">
                <UserSwitch size={13} className="shrink-0" aria-hidden />
                Responde no lugar de {displayName(covering)}, que está ausente.
              </p>
            ) : null}
          </li>
        )
      })}

      <li className="relative py-3 pl-9">
        <Node tone="success">
          <ApprovalMark className="size-3" />
        </Node>

        <p className="text-caption text-muted-foreground">
          {steps.length === 1
            ? "Uma decisão e o pedido está aprovado."
            : `Depois das ${steps.length} etapas, o pedido está aprovado.`}
        </p>
      </li>
    </ol>
  )
}
