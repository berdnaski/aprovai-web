import {
  Check,
  ClockCounterClockwise,
  FileText,
  Gavel,
  Scales,
  ShoppingCart,
  Wallet,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const NAV = [
  { icon: FileText, label: "Pedidos", active: true },
  { icon: ShoppingCart, label: "Ordens de compra" },
  { icon: Scales, label: "Conferência" },
  { icon: Wallet, label: "Contas a pagar" },
  { icon: Gavel, label: "Matriz de alçadas" },
]

const CHAIN = [
  {
    who: "Ana Souza",
    role: "Solicitante",
    note: "enviou · há 2 dias",
    state: "done" as const,
  },
  {
    who: "Bruno Lima",
    role: "Gerente · alçada R$ 10.000",
    note: "fora da alçada",
    state: "skipped" as const,
  },
  {
    who: "Carla Mendes",
    role: "Diretora · alçada R$ 100.000",
    note: "aguardando",
    state: "current" as const,
  },
]

const ITEMS = [
  { name: "Notebook Dell Latitude 5450", qty: "8 un", total: "R$ 41.200,00" },
  { name: "Dock station USB-C", qty: "8 un", total: "R$ 6.100,00" },
]

const BUDGET = {
  label: "Orçamento do Comercial em setembro",
  used: "R$ 128.400,00",
  total: "R$ 220.000,00",
  percent: 58,
}

export function AppMockup() {
  return (
    <div className="flex min-w-[860px] bg-card">
        <aside className="flex w-52 shrink-0 flex-col gap-1 border-r border-border bg-background px-3 py-4">
          <span className="px-2 pb-3 text-label text-foreground">AprovAI</span>

          {NAV.map((item) => (
            <span
              key={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-caption",
                item.active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <item.icon size={14} aria-hidden />
              {item.label}
            </span>
          ))}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 px-6 py-5">
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="text-micro tabular-nums text-muted-foreground">
                REQ-2026-0042
              </p>
              <p className="text-heading text-foreground">
                Notebooks para o time de vendas
              </p>
            </div>

            <span className="ml-auto flex items-center gap-2 rounded-md border border-primary/20 bg-primary/[0.07] px-2 py-1 text-micro font-medium text-primary">
              Em aprovação
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-border pb-4">
            <span className="text-display tabular-nums text-foreground">
              R$ 47.300,00
            </span>
            <span className="text-caption text-muted-foreground">
              Comercial · TI e Equipamentos
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="flex flex-col gap-2">
              <p className="text-overline text-muted-foreground/70">Itens</p>

              <div className="overflow-hidden rounded-lg border border-border">
                {ITEMS.map((item, index) => (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5",
                      index > 0 && "border-t border-border/60",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-caption text-foreground">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-micro tabular-nums text-muted-foreground">
                      {item.qty}
                    </span>
                    <span className="shrink-0 text-caption tabular-nums text-foreground">
                      {item.total}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-1 flex flex-col gap-2 rounded-lg border border-border bg-muted/30 px-3 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="text-micro text-muted-foreground">
                    {BUDGET.label}
                  </span>
                  <span className="text-micro tabular-nums text-foreground">
                    {BUDGET.used} de {BUDGET.total}
                  </span>
                </div>

                <span
                  aria-hidden
                  className="h-1.5 w-full overflow-hidden rounded-xs bg-border"
                >
                  <span
                    className="block h-full rounded-xs bg-chart-1"
                    style={{ width: `${BUDGET.percent}%` }}
                  />
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-overline text-muted-foreground/70">
                Cadeia de aprovação
              </p>

              <div className="overflow-hidden rounded-lg border border-border">
                {CHAIN.map((step, index) => (
                  <div
                    key={step.who}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5",
                      index > 0 && "border-t border-border/60",
                      step.state === "current" && "bg-primary/[0.04]",
                      step.state === "skipped" && "opacity-60",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold",
                        step.state === "done"
                          ? "border-brand-accent bg-brand-accent text-white"
                          : step.state === "current"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-dashed border-border text-muted-foreground",
                      )}
                    >
                      {step.state === "done" ? (
                        <Check size={10} weight="bold" />
                      ) : step.state === "current" ? (
                        <ClockCounterClockwise size={11} />
                      ) : (
                        "–"
                      )}
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-caption font-medium text-foreground">
                        {step.who}
                      </span>
                      <span className="truncate text-micro text-muted-foreground">
                        {step.role}
                      </span>
                    </span>

                    <span
                      className={cn(
                        "shrink-0 text-micro",
                        step.state === "skipped"
                          ? "text-warning-strong"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
