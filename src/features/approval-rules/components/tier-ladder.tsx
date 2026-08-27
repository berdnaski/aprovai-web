import { Plus } from "@phosphor-icons/react"

import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import {
  MAX_TIERS,
  floorOf,
  insertTierAfter,
  removeTier,
  setTierFloor,
  updateTier,
  type Tier,
  type TierProblem,
} from "../matrix"
import { COL_AMOUNTS, COL_SIGNATURE, TierRow } from "./tier-row"

function ColumnHeader({ readOnly }: { readOnly: boolean }) {
  return (
    <div className="hidden min-h-9 items-center gap-4 border-b border-border bg-muted/35 pr-3 pl-12 2xl:flex">
      <span
        className={cn(
          "shrink-0 text-overline text-muted-foreground/70",
          COL_AMOUNTS,
        )}
      >
        Faixa de valor
      </span>

      <div className="flex min-w-0 flex-1 gap-3">
        <span className="min-w-0 flex-1 text-overline text-muted-foreground/70">
          Quem aprova
        </span>
        <span
          className={cn(
            "shrink-0 text-overline text-muted-foreground/70",
            COL_SIGNATURE,
          )}
        >
          Assinaturas
        </span>
      </div>

      {readOnly ? null : <span aria-hidden className="w-15 shrink-0" />}
    </div>
  )
}

export function TierLadder({
  tiers,
  problems,
  dualThresholdCents,
  highlightIndex,
  readOnly = false,
  onChange,
  className,
}: {
  tiers: Tier[]
  problems: TierProblem[]
  dualThresholdCents: string | null
  highlightIndex?: number
  readOnly?: boolean
  onChange: (tiers: Tier[]) => void
  className?: string
}) {
  const problemOf = new Map(problems.map((item) => [item.key, item.message]))
  const atLimit = tiers.length >= MAX_TIERS

  function floorAt(index: number): string | null {
    if (index > 0 && !tiers[index - 1].ceilingCents) {
      return null
    }

    return floorOf(tiers, index)
  }

  function forcedDualAt(index: number): boolean {
    if (!dualThresholdCents) {
      return false
    }

    return BigInt(floorOf(tiers, index)) >= BigInt(dualThresholdCents)
  }

  return (
    <section
      aria-label="Faixas de valor"
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs",
        className,
      )}
    >
      <ColumnHeader readOnly={readOnly} />

      <ol className="divide-y divide-border/50">
        {tiers.map((tier, index) => (
          <TierRow
            key={tier.key}
            index={index}
            total={tiers.length}
            floorCents={floorAt(index)}
            tier={tier}
            problem={problemOf.get(tier.key)}
            floorInvalid={index > 0 && problemOf.has(tiers[index - 1].key)}
            forcedDual={forcedDualAt(index)}
            forcedDualReason={
              dualThresholdCents
                ? `A política da empresa exige duas assinaturas a partir de ${formatCents(dualThresholdCents)}.`
                : undefined
            }
            highlighted={highlightIndex === index}
            readOnly={readOnly}
            onChange={(patch) => onChange(updateTier(tiers, index, patch))}
            onFloorChange={(cents) => onChange(setTierFloor(tiers, index, cents))}
            onSplit={() => onChange(insertTierAfter(tiers, index))}
            onRemove={() => onChange(removeTier(tiers, index))}
          />
        ))}
      </ol>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-3 py-2">
        {readOnly ? null : (
          <button
            type="button"
            onClick={() => onChange(insertTierAfter(tiers, tiers.length - 1))}
            disabled={atLimit}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2 text-caption transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
            )}
          >
            <Plus size={13} weight="bold" aria-hidden />
            Adicionar faixa
          </button>
        )}

        <p className="ml-auto text-caption text-muted-foreground">
          {atLimit
            ? `Limite de ${MAX_TIERS} faixas.`
            : "Da faixa, o pedido sobe pela hierarquia até alguém ter alçada."}
        </p>
      </footer>
    </section>
  )
}
