import type { MatchResult } from "@/api/matching"
import { MoneyDisplay } from "@/components/shared/money-display"
import { cn } from "@/lib/utils"

function diff(from: string, to: string): bigint {
  return BigInt(to || "0") - BigInt(from || "0")
}

export function MatchComparison({ result }: { result: MatchResult }) {
  const columns = [
    {
      label: "Pedido",
      hint: "o que foi combinado",
      cents: result.orderedAmountCents,
      tone: "neutral" as const,
    },
    {
      label: "Recebido",
      hint: "o que chegou",
      cents: result.receivedAmountCents,
      tone: "neutral" as const,
    },
    {
      label: "Faturado",
      hint: "o que o fornecedor cobrou",
      cents: result.invoicedAmountCents,
      tone: "compare" as const,
    },
  ]

  const gap = diff(result.orderedAmountCents, result.invoicedAmountCents)

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-12 items-center border-b border-border px-5">
        <h2 className="text-caption font-medium text-foreground">
          Pedido, recebido e faturado
        </h2>
      </header>

      <div className="grid divide-y divide-border/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {columns.map((column) => (
          <div key={column.label} className="flex flex-col gap-1 px-5 py-4">
            <p className="text-overline text-muted-foreground/70">
              {column.label}
            </p>
            <MoneyDisplay
              cents={column.cents}
              emphasis
              className={cn(
                "text-heading",
                column.tone === "compare" && gap > 0n
                  ? "text-warning-strong"
                  : "text-foreground",
              )}
            />
            <p className="text-caption text-muted-foreground">{column.hint}</p>
          </div>
        ))}
      </div>

      {gap !== 0n ? (
        <footer className="border-t border-border bg-muted/25 px-5 py-3">
          <p className="text-caption leading-relaxed text-foreground">
            A nota veio{" "}
            <span
              className={cn(
                "font-medium",
                gap > 0n ? "text-warning-strong" : "text-brand-accent-strong",
              )}
            >
              <MoneyDisplay cents={(gap < 0n ? -gap : gap).toString()} />{" "}
              {gap > 0n ? "acima" : "abaixo"}
            </span>{" "}
            do que foi pedido. Tolerância da empresa:{" "}
            {result.priceTolerancePercent}% em preço e{" "}
            {result.quantityTolerancePercent}% em quantidade.
          </p>
        </footer>
      ) : null}
    </section>
  )
}
