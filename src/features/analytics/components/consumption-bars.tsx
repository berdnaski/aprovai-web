import { Stack } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import type { CostCenterConsumption } from "@/api/analytics"
import { MoneyDisplay } from "@/components/shared/money-display"
import { cn } from "@/lib/utils"

import { PanelEmpty } from "./panel-empty"

const OVER = 100
const NEAR = 85

export function ConsumptionBars({
  items,
}: {
  items: CostCenterConsumption[]
}) {
  const withBudget = items.filter((item) => BigInt(item.budgetCents) > 0n)

  if (withBudget.length === 0) {
    return (
      <PanelEmpty
        icon={Stack}
        title="Nenhum teto definido"
        description="Defina o orçamento de um centro de custo para acompanhar o consumo aqui."
        action={{ label: "Ir para centros de custo", to: "/centros-de-custo" }}
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-border/50">
      {withBudget.map((item) => {
        const percent = Math.round(item.usagePercent)
        const over = percent >= OVER
        const near = percent >= NEAR && percent < OVER

        return (
          <li key={item.costCenterId}>
            <Link
              to={`/centros-de-custo/${item.costCenterId}`}
              className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <div className="flex items-baseline gap-3">
                <span className="min-w-0 flex-1 truncate text-caption font-medium text-foreground">
                  {item.costCenterName}
                </span>

                <span
                  className={cn(
                    "shrink-0 text-caption tabular-nums",
                    over
                      ? "font-medium text-destructive"
                      : near
                        ? "font-medium text-warning-strong"
                        : "text-muted-foreground",
                  )}
                >
                  {percent}%
                </span>
              </div>

              <div
                role="img"
                aria-label={`${percent}% do orçamento comprometido`}
                className="relative h-1.5 w-full overflow-hidden rounded-xs bg-muted"
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-xs transition-[width] duration-300 ease-out",
                    over
                      ? "bg-destructive"
                      : near
                        ? "bg-warning"
                        : "bg-chart-1",
                  )}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>

              <p className="text-caption tabular-nums text-muted-foreground">
                <MoneyDisplay cents={item.committedCents} /> de{" "}
                <MoneyDisplay cents={item.budgetCents} />
                {over ? (
                  <span className="text-destructive">
                    {" · "}estourou o teto
                  </span>
                ) : null}
              </p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
