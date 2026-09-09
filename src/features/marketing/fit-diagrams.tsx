import {
  ArrowDown,
  Calculator,
  DotsThree,
  Percent,
  UsersThree,
} from "@phosphor-icons/react"

import sidebar from "@/assets/app-sidebar.png"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { cn } from "@/lib/utils"

const FRAME = "relative w-full md:h-[470px]"

const WINDOW =
  "overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_14px_36px_-18px_oklch(0.2_0_0/0.24)]"

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
      {initials}
    </span>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-md bg-brand-accent/12 px-1.5 py-0.5 text-[10px] leading-4 font-medium whitespace-nowrap text-brand-accent-strong">
      {children}
    </span>
  )
}

export function StandaloneApp() {
  return (
    <div className="relative flex h-[280px] w-full justify-center overflow-hidden md:h-[470px]">
      <div className="relative w-[330px] overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_18px_44px_-24px_oklch(0.2_0_0/0.2)]">
        <img
          src={sidebar}
          alt="Menu do AprovAI: pedidos, ordens de compra, recebimentos, conferência, contas a pagar, centros de custo, matriz de alçadas, fornecedores, categorias, equipe, dashboard e auditoria"
          className="block h-auto w-full max-w-none"
          loading="lazy"
          decoding="async"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
          style={{
            background: "linear-gradient(180deg, transparent 0%, var(--card) 88%)",
          }}
        />
      </div>
    </div>
  )
}

const ERP_ROWS = [
  { icon: Calculator, label: "Contabilidade", bar: 82 },
  { icon: Percent, label: "Fiscal", bar: 64 },
  { icon: UsersThree, label: "Folha", bar: 48 },
]

export function ErpHandoff() {
  return (
    <div className={cn(FRAME, "flex flex-col justify-center")}>
      <div className={WINDOW}>
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
          <span className="text-[11.5px] leading-4 font-semibold text-primary">
            AprovAI
          </span>
          <Pill>
            <ApprovalMark className="size-2.5" />
            Conferido
          </Pill>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-3">
          <Avatar initials="MA" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] leading-4 font-medium text-foreground/85">
              Pedido #1042 · Notebooks Dell
            </p>
            <p className="text-[9.5px] leading-3 text-muted-foreground">
              Pedido, ordem e nota batem
            </p>
          </div>
          <span className="tabular shrink-0 text-[12px] leading-4 font-semibold text-foreground">
            R$ 18.864,65
          </span>
        </div>
      </div>

      <div className="relative flex h-16 w-full items-center justify-center">
        <span
          aria-hidden
          className="absolute h-full border-l border-dashed border-border"
        />
        <span className="relative z-10 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-[0_6px_16px_-6px_oklch(0.2_0_0/0.22)]">
          <ArrowDown size={11} weight="bold" className="text-muted-foreground" />
          <span className="tabular text-[10.5px] leading-4 font-semibold text-foreground/80">
            conciliacao-set.csv
          </span>
        </span>
      </div>

      <div className={cn(WINDOW, "border-border/80 bg-muted/40 shadow-none")}>
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
          <span className="text-[11.5px] leading-4 font-semibold text-muted-foreground">
            Seu ERP
          </span>
          <DotsThree size={14} className="text-muted-foreground/60" />
        </div>

        <div className="flex flex-col gap-2.5 px-4 py-3">
          {ERP_ROWS.map((row) => (
            <div key={row.label} className="flex items-center gap-2.5">
              <row.icon size={13} className="shrink-0 text-muted-foreground/70" />
              <span className="w-[76px] shrink-0 text-[10.5px] leading-4 text-muted-foreground">
                {row.label}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/70">
                <span
                  className="block h-full rounded-full bg-muted-foreground/25"
                  style={{ width: `${row.bar}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
