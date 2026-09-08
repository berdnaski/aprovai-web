import { ArrowUp, FilePdf, Sparkle, X } from "@phosphor-icons/react"

import { ApprovalMark } from "@/components/shared/approval-mark"

function MockupFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[264px] w-[280px] shrink-0">
      <div className="relative size-full">{children}</div>
    </div>
  )
}

function Reveal({
  delay,
  className = "",
  children,
}: {
  delay: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-reveal
      className={className}

      style={
        {
          "--reveal-delay": `calc(var(--col-delay, 0ms) + ${delay}ms)`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

const CARD =
  "rounded-2xl border border-border/70 bg-card shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_10px_28px_-14px_oklch(0.2_0_0/0.16)]"

const FIELD_LABEL =
  "text-[10px] leading-3 font-medium tracking-[0.05em] text-muted-foreground uppercase"

function Bar({ w, dim = false }: { w: number; dim?: boolean }) {
  return (
    <span
      className={`block h-1.5 rounded-full ${dim ? "bg-foreground/6" : "bg-foreground/10"}`}
      style={{ width: `${w}px` }}
    />
  )
}

export function RequestMockup() {
  return (
    <MockupFrame>
      <Reveal delay={0} className="absolute top-2 left-1/2 w-[224px] -translate-x-1/2">
        <div className={`${CARD} flex items-center gap-2.5 p-3.5`}>
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-destructive/8 text-destructive">
            <FilePdf size={16} />
          </span>
          <div className="flex flex-col gap-1.5">
            <Bar w={116} />
            <Bar w={64} dim />
          </div>
        </div>
      </Reveal>

      <Reveal
        delay={140}
        className="absolute top-[80px] left-1/2 flex h-[62px] -translate-x-1/2 justify-center"
      >
        <span className="h-full w-px border-l border-dashed border-border" />
      </Reveal>

      <Reveal
        delay={240}
        className="absolute top-[96px] left-1/2 -translate-x-1/2"
      >
        <span className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-card py-1.5 pr-3 pl-2.5 shadow-[0_6px_16px_-6px_oklch(0.2_0_0/0.22)]">
          <Sparkle size={12} weight="fill" className="text-primary" />
          <span className="text-[10px] leading-4 font-semibold text-primary">
            Extraído do PDF
          </span>
        </span>
      </Reveal>

      <Reveal
        delay={380}
        className="absolute top-[152px] left-1/2 w-[224px] -translate-x-1/2"
      >
        <div className={`${CARD} flex flex-col gap-3 p-4`}>
          <div className="flex items-center justify-between">
            <span className={FIELD_LABEL}>Fornecedor</span>
            <span className="text-[11px] leading-4 font-medium text-foreground/80">
              Dell Brasil
            </span>
          </div>
          <span className="h-px w-full bg-border/70" />
          <div className="flex items-center justify-between">
            <span className={FIELD_LABEL}>Valor</span>
            <span className="tabular text-[11px] leading-4 font-semibold text-foreground">
              R$ 18.864,65
            </span>
          </div>
        </div>
      </Reveal>
    </MockupFrame>
  )
}

export function ApprovalMockup() {
  return (
    <MockupFrame>
      <Reveal delay={0} className="absolute top-1 left-1/2 w-[224px] -translate-x-1/2">
        <div className={CARD}>
          <div className="flex items-center gap-2.5 border-b border-border/70 px-4 py-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
              AI
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] leading-3 font-semibold text-foreground/85">
                Pedido #1042
              </span>
              <span className="tabular text-[10px] leading-3 text-muted-foreground">
                R$ 18.864,65
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 px-4 py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] leading-4 text-muted-foreground">
                Centro de custo
              </span>
              <span className="text-[10px] leading-4 font-medium text-foreground/80">
                Tecnologia
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] leading-4 text-muted-foreground">
                Saldo após aprovar
              </span>
              <span className="tabular text-[10px] leading-4 font-medium text-foreground/80">
                R$ 37.600
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal
        delay={220}
        className="absolute top-[150px] left-1/2 flex w-[208px] -translate-x-1/2 gap-2"
      >
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-accent py-2.5 text-[11px] leading-4 font-semibold text-brand-accent-foreground shadow-[0_1px_2px_oklch(0.2_0_0/0.06),0_8px_20px_-10px_oklch(0.2_0_0/0.3)]">
          <ApprovalMark className="size-3" />
          Aprovar
        </span>
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-[11px] leading-4 font-semibold text-muted-foreground">
          <X size={10} weight="bold" />
          Recusar
        </span>
      </Reveal>

      <Reveal delay={420} className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <span className="flex items-center gap-2 rounded-full border border-border/70 bg-card py-1.5 pr-3 pl-2.5 shadow-[0_6px_16px_-6px_oklch(0.2_0_0/0.22)]">
          <span className="size-1.5 rounded-full bg-brand-accent" />
          <span className="text-[10px] leading-4 font-semibold text-foreground/80">
            Respondido em 40s
          </span>
        </span>
      </Reveal>
    </MockupFrame>
  )
}

const TIERS = [
  { range: "até R$ 5 mil", who: "Gestor do CC", strong: false },
  { range: "R$ 5 a 50 mil", who: "Diretoria", strong: true },
  { range: "acima de R$ 50 mil", who: "Dupla assinatura", strong: false },
]

export function RulesMockup() {
  return (
    <MockupFrame>
      <Reveal delay={0} className="absolute top-1 left-1/2 w-[224px] -translate-x-1/2">
        <div className={`${CARD} p-2.5`}>
          <span className={`${FIELD_LABEL} block px-2 pt-1 pb-2`}>
            Matriz de alçadas
          </span>
          <div className="flex flex-col gap-1">
            {TIERS.map((tier) => (
              <div
                key={tier.range}
                className={`flex items-center justify-between rounded-lg px-2 py-2 ${
                  tier.strong ? "bg-primary/6 ring-1 ring-primary/15 ring-inset" : ""
                }`}
              >
                <span className="tabular text-[10px] leading-4 text-muted-foreground">
                  {tier.range}
                </span>
                <span
                  className={`text-[10px] leading-4 font-semibold ${
                    tier.strong ? "text-primary" : "text-foreground/75"
                  }`}
                >
                  {tier.who}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal
        delay={260}
        className="absolute bottom-2 left-1/2 w-[224px] -translate-x-1/2"
      >
        <div className={`${CARD} p-4`}>
          <div className="flex items-baseline justify-between">
            <span className={FIELD_LABEL}>Marketing · Set</span>
            <span className="flex items-center gap-0.5 text-[11px] leading-4 font-semibold text-foreground/80">
              <ArrowUp size={10} weight="bold" className="text-warning" />
              <span className="tabular">62%</span>
            </span>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span className="block h-full w-0 rounded-full bg-primary transition-[width] delay-[560ms] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[shown=true]/col:w-[62%]" />
          </div>
        </div>
      </Reveal>
    </MockupFrame>
  )
}
