import type { ItemBalance } from "@/api/purchase-orders"
import { cn } from "@/lib/utils"

function num(value: string): number {
  const parsed = Number(value.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : 0
}

function trim(value: string): string {
  const parsed = num(value)
  return parsed % 1 === 0 ? String(parsed) : String(parsed).replace(".", ",")
}

export function OrderBalance({ balance }: { balance: ItemBalance[] }) {
  const complete = balance.every((item) => num(item.pendingQuantity) <= 0)

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-5 py-3">
        <h2 className="text-caption font-medium text-foreground">
          Saldo por item
        </h2>
        <p className="text-caption text-muted-foreground">
          {complete
            ? "Tudo que foi pedido já chegou."
            : "O que ainda falta chegar do fornecedor."}
        </p>
      </header>

      <div className="hidden items-center gap-3 border-b border-border bg-muted/35 px-5 py-1.5 sm:flex">
        <span className="min-w-0 flex-1 text-overline text-muted-foreground/70">
          Item
        </span>
        <span className="w-24 shrink-0 text-right text-overline text-muted-foreground/70">
          Pedido
        </span>
        <span className="w-24 shrink-0 text-right text-overline text-muted-foreground/70">
          Recebido
        </span>
        <span className="w-24 shrink-0 text-right text-overline text-muted-foreground/70">
          Pendente
        </span>
      </div>

      {balance.length === 0 ? (
        <p className="px-5 py-8 text-center text-caption text-muted-foreground">
          Esta ordem não tem itens.
        </p>
      ) : (
        <ul className="divide-y divide-border/50">
          {balance.map((item) => {
            const pending = num(item.pendingQuantity)
            const received = num(item.receivedQuantity)

            return (
              <li
                key={item.itemId}
                className="flex flex-col gap-1.5 px-5 py-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="min-w-0 flex-1 truncate text-caption text-foreground">
                  {item.description}
                </span>

                <span className="flex items-center gap-3 sm:contents">
                  <span className="w-24 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
                    {trim(item.orderedQuantity)} {item.unit}
                  </span>

                  <span
                    className={cn(
                      "w-24 shrink-0 text-right text-caption tabular-nums",
                      received > 0
                        ? "text-brand-accent-strong"
                        : "text-muted-foreground",
                    )}
                  >
                    {trim(item.receivedQuantity)}
                  </span>

                  <span
                    className={cn(
                      "w-24 shrink-0 text-right text-caption font-medium tabular-nums",
                      pending > 0 ? "text-warning-strong" : "text-muted-foreground",
                    )}
                  >
                    {pending > 0 ? trim(item.pendingQuantity) : "—"}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
