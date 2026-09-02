import { ArrowUUpLeft, Check, Warning, X } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const TIERS = [
  { range: "R$ 0 – 10.000", who: "Gerente", active: false },
  { range: "R$ 10.001 – 100.000", who: "Diretora", active: true },
  { range: "acima de R$ 100.000", who: "Diretoria + CEO", active: false },
]

export function TierLadder() {
  return (
    <div className="flex flex-col gap-1.5">
      {TIERS.map((tier) => (
        <div
          key={tier.range}
          className={cn(
            "flex items-center gap-2.5 rounded-md border px-2.5 py-2",
            tier.active
              ? "border-primary/25 bg-primary/[0.06]"
              : "border-border bg-background",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "h-5 w-0.5 shrink-0 rounded-full",
              tier.active ? "bg-primary" : "bg-border",
            )}
          />
          <span className="min-w-0 flex-1 truncate text-micro tabular-nums text-muted-foreground">
            {tier.range}
          </span>
          <span
            className={cn(
              "shrink-0 text-micro",
              tier.active ? "font-medium text-primary" : "text-muted-foreground",
            )}
          >
            {tier.who}
          </span>
        </div>
      ))}
    </div>
  )
}

export function EmailDecision() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="border-b border-border px-3 py-2">
        <p className="text-micro text-muted-foreground">
          De: AprovAI · para Carla Mendes
        </p>
        <p className="truncate text-caption font-medium text-foreground">
          REQ-2026-0042 aguarda sua aprovação
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="flex items-center gap-1.5 rounded-md bg-brand-accent px-2.5 py-1.5 text-micro font-medium text-white">
          <Check size={11} weight="bold" aria-hidden />
          Aprovar
        </span>
        <span className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-micro font-medium text-muted-foreground">
          <X size={11} weight="bold" aria-hidden />
          Recusar
        </span>
        <span className="ml-auto text-micro text-muted-foreground">
          sem login
        </span>
      </div>
    </div>
  )
}

const MATCH = [
  { label: "Pedido", value: "R$ 10.000", tone: "muted" as const },
  { label: "Recebido", value: "R$ 10.000", tone: "muted" as const },
  { label: "Faturado", value: "R$ 11.400", tone: "warn" as const },
]

export function MatchColumns() {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        {MATCH.map((column) => (
          <div
            key={column.label}
            className={cn(
              "flex flex-col gap-0.5 rounded-md border px-2 py-2",
              column.tone === "warn"
                ? "border-warning/30 bg-warning/[0.07]"
                : "border-border bg-background",
            )}
          >
            <span className="text-micro text-muted-foreground">
              {column.label}
            </span>
            <span
              className={cn(
                "text-caption tabular-nums",
                column.tone === "warn"
                  ? "font-medium text-warning-strong"
                  : "text-foreground",
              )}
            >
              {column.value}
            </span>
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-micro text-warning-strong">
        <Warning size={11} weight="fill" aria-hidden />
        R$ 1.400 acima · pagamento travado
      </p>
    </div>
  )
}

export function BudgetMeter() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-micro text-muted-foreground">Comercial</span>
        <span className="text-micro tabular-nums text-foreground">
          R$ 128.400 de 220.000
        </span>
      </div>

      <span
        aria-hidden
        className="h-1.5 w-full overflow-hidden rounded-xs bg-muted"
      >
        <span className="block h-full w-[58%] rounded-xs bg-chart-1" />
      </span>

      <p className="text-micro text-muted-foreground">
        Sobra R$ 91.600 antes do teto
      </p>
    </div>
  )
}

export function EscalationTimer() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center rounded-md border border-warning/30 bg-warning/10 text-warning-strong"
        >
          <ArrowUUpLeft size={11} weight="bold" />
        </span>
        <span className="min-w-0 flex-1 truncate text-caption text-foreground">
          Escalou para a Diretoria
        </span>
      </div>

      <p className="text-micro tabular-nums text-muted-foreground">
        Bruno não decidiu em 72h úteis · 01/09, 09:00
      </p>
    </div>
  )
}
