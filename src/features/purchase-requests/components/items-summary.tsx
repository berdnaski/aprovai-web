import type { RequestItem } from "@/api/purchase-requests"
import { MoneyDisplay } from "@/components/shared/money-display"
import { cn } from "@/lib/utils"

function share(itemCents: string, totalCents: string): number {
  const total = Number(totalCents)

  if (total <= 0) {
    return 0
  }

  return Math.round((Number(itemCents) / total) * 100)
}

function trim(value: string): string {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return value
  }

  return parsed % 1 === 0 ? String(parsed) : String(parsed).replace(".", ",")
}

export function ItemsSummary({
  items,
  totalCents,
}: {
  items: RequestItem[]
  totalCents: string
}) {
  const biggest = items.reduce(
    (max, item) => Math.max(max, Number(item.totalCents)),
    0,
  )

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex items-center gap-2 border-b border-border px-6 py-4">
        <h2 className="text-caption font-medium text-foreground">Itens</h2>
        <span className="rounded bg-muted px-1.5 text-caption tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </header>

      {items.length === 0 ? (
        <p className="px-6 py-10 text-center text-caption text-muted-foreground">
          Este pedido não tem itens.
        </p>
      ) : (
        <ul className="divide-y divide-border/50">
          {items.map((item, index) => {
            const percent = share(item.totalCents, totalCents)
            const dominant = Number(item.totalCents) === biggest

            return (
              <li
                key={item.id}
                className="group flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-muted/25"
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[11px] leading-none font-semibold tabular-nums text-muted-foreground"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-body font-medium text-foreground">
                      {item.description}
                    </p>
                    <p className="text-caption tabular-nums text-muted-foreground">
                      {trim(item.quantity)} {item.unit} ×{" "}
                      <MoneyDisplay cents={item.unitPriceCents} />
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <MoneyDisplay
                      cents={item.totalCents}
                      emphasis
                      className="text-heading"
                    />
                    <span className="text-micro tabular-nums text-muted-foreground/70">
                      {percent}% do pedido
                    </span>
                  </div>
                </div>

                <span
                  aria-hidden
                  className="ml-11 h-1 overflow-hidden rounded-xs bg-muted"
                >
                  <span
                    className={cn(
                      "block h-full rounded-xs transition-[width] duration-500 ease-out",
                      dominant ? "bg-chart-1" : "bg-chart-1/35",
                    )}
                    style={{ width: `${Math.max(percent, 2)}%` }}
                  />
                </span>
              </li>
            )
          })}
        </ul>
      )}

      <footer className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border bg-muted/25 px-6 py-4">
        <span className="text-caption text-muted-foreground">
          Total do pedido
        </span>
        <MoneyDisplay
          cents={totalCents}
          emphasis
          className="ml-auto text-display"
        />
      </footer>
    </section>
  )
}
