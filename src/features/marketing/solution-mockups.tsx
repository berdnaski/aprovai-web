import pedidos from "@/assets/app-pedidos.png"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { cn } from "@/lib/utils"

const FRAME =
  "flex h-full items-center overflow-hidden rounded-[18px] border border-border bg-background shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_20px_48px_-28px_oklch(0.2_0_0/0.22)]"

export function ApprovalFlowMockup() {
  return (
    <div className={FRAME}>
      <img
        src={pedidos}
        alt="Tela de pedidos do AprovAI, com a fila de requisições, situação e valor de cada uma"
        className="block h-auto w-full"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

const ROWS = [
  {
    nota: "12345",
    ref: "OC-2026-0002",
    tone: "warning" as const,
    status: "Com divergência",
    diff: "1",
    pedido: "47.300,00",
    faturado: "48.700,00",
    alerta: true,
  },
  {
    nota: "9999",
    ref: "PO-2026-0001",
    tone: "warning" as const,
    status: "Com divergência",
    diff: "3",
    pedido: "25.500,00",
    faturado: "27.000,00",
    alerta: true,
  },
  {
    nota: "44219",
    ref: "OC-2026-0007",
    tone: "success" as const,
    status: "Conferido",
    diff: "0",
    pedido: "18.864,65",
    faturado: "18.864,65",
    alerta: false,
  },
  {
    nota: "44102",
    ref: "OC-2026-0006",
    tone: "success" as const,
    status: "Conferido",
    diff: "0",
    pedido: "7.200,00",
    faturado: "7.200,00",
    alerta: false,
  },
  {
    nota: "43877",
    ref: "OC-2026-0005",
    tone: "neutral" as const,
    status: "Aguardando nota",
    diff: "0",
    pedido: "12.940,00",
    faturado: null,
    alerta: false,
  },
  {
    nota: "43690",
    ref: "OC-2026-0004",
    tone: "success" as const,
    status: "Conferido",
    diff: "0",
    pedido: "3.480,00",
    faturado: "3.480,00",
    alerta: false,
  },
]

const PILL = {
  warning: "border-warning/30 bg-warning/10 text-warning-strong",
  success: "border-brand-accent/25 bg-brand-accent/10 text-brand-accent-strong",
  neutral: "border-border bg-muted text-muted-foreground",
}

const HEAD = "text-[8.5px] leading-3 font-medium tracking-[0.06em] text-muted-foreground uppercase"

const GRID =
  "grid grid-cols-[minmax(0,1fr)_104px_72px_92px_92px] items-center gap-3"

export function FinanceFlowMockup() {
  return (
    <div className={FRAME}>
      <div className="flex h-full w-full flex-col px-7 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[17px] leading-6 font-semibold tracking-[-0.01em] text-foreground">
              Conferência
            </h3>
            <p className="mt-0.5 max-w-[380px] text-[10px] leading-4 text-muted-foreground">
              Compara o que foi pedido, o que chegou e o que o fornecedor
              faturou, antes de liberar o pagamento.
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-accent/25 bg-brand-accent/10 px-2 py-1 text-[9.5px] leading-4 font-semibold text-brand-accent-strong">
            <ApprovalMark className="size-2.5" />4 de 6 conferidas
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4 border-b border-border/70">
          <span className="-mb-px border-b-2 border-foreground pb-1.5 text-[10.5px] leading-4 font-medium text-foreground">
            Conferências
          </span>
          <span className="pb-1.5 text-[10.5px] leading-4 text-muted-foreground">
            Notas recebidas
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1 self-start rounded-lg border border-border bg-muted/60 p-0.5">
          <span className="flex items-center gap-1.5 rounded-[6px] border border-border bg-card px-2 py-1 text-[9.5px] leading-4 font-medium text-foreground">
            <span className="size-1 rounded-full bg-warning" />
            Precisam de você
            <span className="text-muted-foreground">2</span>
          </span>
          <span className="rounded-[6px] px-2 py-1 text-[9.5px] leading-4 text-muted-foreground">
            Todas
          </span>
        </div>

        <div className="mt-3 flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className={cn(GRID, "border-b border-border/70 px-3.5 py-2")}>
            <span className={HEAD}>Nota</span>
            <span className={HEAD}>Situação</span>
            <span className={cn(HEAD, "text-right")}>Divergências</span>
            <span className={cn(HEAD, "text-right")}>Pedido</span>
            <span className={cn(HEAD, "text-right")}>Faturado</span>
          </div>

          <div className="flex flex-1 flex-col">
            {ROWS.map((row) => (
              <div
                key={row.nota}
                className={cn(
                  GRID,
                  "relative flex-1 border-b border-border/40 px-3.5 last:border-b-0",
                )}
              >
                {row.alerta ? (
                  <span className="absolute inset-y-0 left-0 w-[2.5px] bg-warning" />
                ) : null}

                <div className="min-w-0">
                  <p className="truncate text-[10.5px] leading-4 font-medium text-foreground">
                    {row.nota}
                  </p>
                  <p className="truncate font-mono text-[8.5px] leading-3 text-muted-foreground">
                    {row.ref}
                  </p>
                </div>

                <span
                  className={cn(
                    "inline-flex w-fit items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] leading-4 font-medium whitespace-nowrap",
                    PILL[row.tone],
                  )}
                >
                  {row.tone === "success" ? (
                    <ApprovalMark className="size-2" />
                  ) : null}
                  {row.status}
                </span>

                <span
                  className={cn(
                    "tabular text-right text-[10px] leading-4",
                    row.alerta
                      ? "font-semibold text-warning-strong"
                      : "text-muted-foreground",
                  )}
                >
                  {row.diff}
                </span>

                <span className="tabular text-right text-[10px] leading-4 text-muted-foreground">
                  R$ {row.pedido}
                </span>

                <span
                  className={cn(
                    "tabular text-right text-[10px] leading-4",
                    row.faturado
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground/50",
                  )}
                >
                  {row.faturado ? `R$ ${row.faturado}` : "aguardando"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border/70 px-3.5 py-2">
            <span className="text-[9.5px] leading-4 text-muted-foreground">
              6 conferências
            </span>
            <span className="tabular text-[9.5px] leading-4 font-medium text-foreground/70">
              Divergência total · R$ 2.900,00
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
