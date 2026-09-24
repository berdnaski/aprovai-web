import { ChartBar } from "@phosphor-icons/react"
import { useState } from "react"

import type { DreLine } from "@/api/analytics"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { StatRow, StatTile } from "@/components/shared/stat-tile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useDre } from "@/hooks/analytics/use-analytics"
import { cn } from "@/lib/utils"

const GROUPS: { kind: DreLine["kind"]; title: string; hint: string }[] = [
  {
    kind: "REVENUE",
    title: "Receitas",
    hint: "contas de receita do plano de contas",
  },
  {
    kind: "COST",
    title: "Custos",
    hint: "o que entra direto na obra ou no serviço vendido",
  },
  {
    kind: "EXPENSE",
    title: "Despesas",
    hint: "estrutura, administrativo e comercial",
  },
]

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function rangeOf(month: string): { from: string; to: string } {
  const [year, monthNumber] = month.split("-").map(Number)
  const last = new Date(year, monthNumber, 0).getDate()

  return {
    from: `${month}-01`,
    to: `${month}-${String(last).padStart(2, "0")}`,
  }
}

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number)

  return new Date(year, monthNumber - 1, 1)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(" de ", " de ")
}

export function DrePage() {
  const [month, setMonth] = useState(() => monthKey(new Date()))
  const range = rangeOf(month)
  const dreQuery = useDre(range)

  const header = (
    <PageHeader
      title="DRE gerencial"
      description="O que foi efetivamente pago no mês, somado por conta contábil. É o realizado, em regime de caixa, não a DRE societária que o contador fecha."
      action={
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dre-month" className="text-label text-foreground">
            Mês
          </Label>
          <Input
            id="dre-month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value || month)}
            className="h-10 w-44"
          />
        </div>
      }
    />
  )

  if (dreQuery.isPending && !dreQuery.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        {header}
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (dreQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <LoadError onRetry={() => void dreQuery.refetch()} />
      </div>
    )
  }

  const report = dreQuery.data
  const lines = report?.lines ?? []
  const result = BigInt(report?.resultCents ?? 0)
  const saida =
    BigInt(report?.costCents ?? 0) + BigInt(report?.expenseCents ?? 0)

  return (
    <div className="flex flex-col gap-6">
      {header}

      <StatRow>
        <StatTile
          label="Receitas"
          value={<MoneyDisplay cents={report?.revenueCents ?? "0"} />}
          hint="entradas lançadas em contas de receita"
        />
        <StatTile
          label="Custos"
          value={<MoneyDisplay cents={report?.costCents ?? "0"} />}
          hint="ligados à operação"
        />
        <StatTile
          label="Despesas"
          value={<MoneyDisplay cents={report?.expenseCents ?? "0"} />}
          hint="estrutura e administrativo"
        />
        <StatTile
          label="Resultado"
          value={<MoneyDisplay cents={result.toString()} />}
          tone={result < 0n ? "warning" : "neutral"}
          hint={
            result < 0n
              ? "saída maior que entrada no mês"
              : "receitas menos custos e despesas"
          }
        />
      </StatRow>

      {lines.length === 0 ? (
        <EmptyState
          icon={ChartBar}
          title={`Nenhum pagamento em ${monthLabel(month)}`}
          description="O DRE soma as contas a pagar quitadas no mês, pelo rateio de cada uma. Assim que houver pagamento com conta contábil, ele aparece aqui."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {GROUPS.map((group) => {
            const groupLines = lines
              .filter((line) => line.kind === group.kind)
              .sort((a, b) => a.code.localeCompare(b.code))

            if (groupLines.length === 0) {
              return null
            }

            const groupTotal = groupLines.reduce(
              (sum, line) => sum + BigInt(line.amountCents),
              0n,
            )

            return (
              <section
                key={group.kind}
                aria-label={group.title}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-xs"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-3.5">
                  <div>
                    <h2 className="text-label text-foreground">
                      {group.title}
                    </h2>
                    <p className="mt-0.5 text-caption text-muted-foreground">
                      {group.hint}
                    </p>
                  </div>
                  <MoneyDisplay
                    cents={groupTotal.toString()}
                    emphasis
                    className="text-subhead"
                  />
                </header>

                <ul className="divide-y divide-border/60">
                  {groupLines.map((line) => {
                    const share =
                      saida > 0n && group.kind !== "REVENUE"
                        ? Number((BigInt(line.amountCents) * 1000n) / saida) / 10
                        : null

                    return (
                      <li
                        key={line.chartAccountId}
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
                      >
                        <span className="w-20 shrink-0 text-caption tabular-nums text-muted-foreground">
                          {line.code}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-body text-foreground">
                          {line.name}
                        </span>
                        {share !== null ? (
                          <span
                            className={cn(
                              "w-16 shrink-0 text-right text-caption tabular-nums",
                              share >= 20
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {share.toFixed(1)}%
                          </span>
                        ) : null}
                        <MoneyDisplay
                          cents={line.amountCents}
                          className="w-32 shrink-0 text-right"
                        />
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}

          <p className="text-caption leading-relaxed text-muted-foreground">
            Só entram contas a pagar já quitadas e com conta contábil no rateio.
            Compra de ativo, como computador ou móvel, não aparece aqui, porque
            vira patrimônio e não despesa do mês.
          </p>
        </div>
      )}
    </div>
  )
}
