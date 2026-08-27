import { ArrowsSplit, Trash } from "@phosphor-icons/react"

import { MoneyInput } from "@/components/ui/money-input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import type { Tier } from "../matrix"
import { ApproverTypeChoice } from "./approver-type-choice"
import { SignatureChoice } from "./signature-choice"

export const COL_AMOUNTS = "2xl:w-[19rem]"
export const COL_SIGNATURE = "2xl:w-[9.5rem]"

function IconAction({
  icon: ActionIcon,
  label,
  onClick,
  disabled = false,
  tone = "neutral",
}: {
  icon: typeof Trash
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: "neutral" | "danger"
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-30",
              tone === "danger"
                ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          />
        }
      >
        <ActionIcon size={14} aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function LockedAmount({
  children,
  reason,
}: {
  children: React.ReactNode
  reason: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            tabIndex={0}
            className={cn(
              "flex h-9 min-w-0 flex-1 cursor-help items-center rounded-lg border border-dashed border-border bg-muted/40 px-3 text-body tabular-nums text-muted-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  )
}

function ReadOnlyAmount({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 min-w-0 flex-1 items-center rounded-lg border border-border px-3 text-body font-medium tabular-nums text-foreground">
      {children}
    </span>
  )
}

function StackedLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-overline text-muted-foreground/70 2xl:hidden">
      {children}
    </span>
  )
}

export function TierRow({
  index,
  total,
  floorCents,
  tier,
  problem,
  floorInvalid = false,
  forcedDual = false,
  forcedDualReason,
  highlighted = false,
  readOnly = false,
  onChange,
  onFloorChange,
  onSplit,
  onRemove,
}: {
  index: number
  total: number
  floorCents: string | null
  tier: Tier
  problem?: string
  floorInvalid?: boolean
  forcedDual?: boolean
  forcedDualReason?: string
  highlighted?: boolean
  readOnly?: boolean
  onChange: (patch: Partial<Omit<Tier, "key">>) => void
  onFloorChange: (cents: string) => void
  onSplit: () => void
  onRemove: () => void
}) {
  const isFirst = index === 0
  const isLast = index === total - 1
  const errorId = problem ? `${tier.key}-erro` : undefined

  const removeLabel = isLast
    ? "Remover — a faixa de baixo passa a valer sem teto"
    : floorCents === null
      ? "Remover esta faixa"
      : `Remover — a faixa de cima passa a começar em ${formatCents(floorCents)}`

  return (
    <li
      className={cn(
        "group/tier relative py-3 pr-3 pl-11 transition-colors sm:pl-12",
        highlighted ? "bg-primary/4.5" : "hover:bg-muted/25",
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-4 w-6">
        {!isFirst ? (
          <span className="absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-border" />
        ) : null}
        {!isLast ? (
          <span className="absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-border" />
        ) : null}

        <span
          className={cn(
            "absolute top-6 left-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-micro tabular-nums transition-colors",
            highlighted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {index + 1}
        </span>
      </span>

      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:gap-4">
        <div className={cn("flex flex-col gap-1.5 2xl:shrink-0", COL_AMOUNTS)}>
          <StackedLabel>Faixa de valor</StackedLabel>

          <div className="flex items-center gap-2">
            {isFirst ? (
              <LockedAmount reason="A primeira faixa sempre começa em R$ 0,00 — é o que garante que nenhum valor fique sem aprovador.">
                R$ 0,00
              </LockedAmount>
            ) : readOnly ? (
              <ReadOnlyAmount>
                {floorCents === null ? "—" : formatCents(floorCents)}
              </ReadOnlyAmount>
            ) : (
              <MoneyInput
                value={floorCents ?? ""}
                onChange={onFloorChange}
                invalid={floorInvalid}
                ariaLabel={`Início da faixa ${index + 1}`}
                className="flex-1"
              />
            )}

            <span
              aria-hidden
              className="shrink-0 text-caption text-muted-foreground/60"
            >
              até
            </span>

            {isLast ? (
              <LockedAmount reason="A última faixa não tem teto: é ela que cobre qualquer valor acima e impede que um pedido caro fique sem aprovador. Para mudar o limite, adicione outra faixa.">
                Sem teto
              </LockedAmount>
            ) : readOnly ? (
              <ReadOnlyAmount>
                {tier.ceilingCents ? formatCents(tier.ceilingCents) : "—"}
              </ReadOnlyAmount>
            ) : (
              <MoneyInput
                value={tier.ceilingCents ?? ""}
                onChange={(cents) => onChange({ ceilingCents: cents })}
                invalid={Boolean(problem)}
                ariaLabel={`Teto da faixa ${index + 1}`}
                ariaDescribedBy={errorId}
                className="flex-1"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row 2xl:min-w-0 2xl:flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <StackedLabel>Quem aprova</StackedLabel>
            <ApproverTypeChoice
              value={tier.approverType}
              onChange={(approverType) => onChange({ approverType })}
              disabled={readOnly}
            />
          </div>

          <div className={cn("flex flex-col gap-1.5 sm:shrink-0", COL_SIGNATURE)}>
            <StackedLabel>Assinaturas</StackedLabel>
            <SignatureChoice
              value={tier.requiresDualApproval}
              onChange={(requiresDualApproval) =>
                onChange({ requiresDualApproval })
              }
              forced={forcedDual}
              forcedReason={forcedDualReason}
              disabled={readOnly}
            />
          </div>
        </div>

        {readOnly ? null : (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/tier:opacity-100 max-2xl:opacity-100">
            <IconAction
              icon={ArrowsSplit}
              label="Dividir — cria uma faixa logo acima desta"
              onClick={onSplit}
              disabled={total >= 50}
            />
            <IconAction
              icon={Trash}
              tone="danger"
              label={removeLabel}
              onClick={onRemove}
              disabled={total <= 1}
            />
          </div>
        )}
      </div>

      {problem ? (
        <p id={errorId} className="mt-2 text-caption text-destructive">
          {problem}
        </p>
      ) : null}
    </li>
  )
}
