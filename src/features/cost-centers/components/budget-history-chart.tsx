import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

import { ChartBar } from "@phosphor-icons/react"

import type { Budget } from "@/api/budgets"
import { EmptyState } from "@/components/shared/empty-state"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { shortPeriodLabel } from "../period"

export function BudgetHistoryChart({
  budgets,
  currentId,
  committedCents,
  className,
}: {
  budgets: Budget[]
  currentId: string
  committedCents: string
  className?: string
}) {
  const animate = !usePrefersReducedMotion()

  const data = [...budgets]
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .slice(-6)
    .map((budget) => {
      const total = Number(budget.totalAmountCents)
      const isCurrent = budget.id === currentId
      const committed = isCurrent ? Number(committedCents) : total

      return {
        id: budget.id,
        label: shortPeriodLabel(budget),
        percent: total > 0 ? Math.round((committed / total) * 100) : 0,
        committedCents: String(committed),
        totalCents: budget.totalAmountCents,
        current: isCurrent,
        overBudget: committed > total,
      }
    })

  if (data.length < 2) {
    return (
      <EmptyState
        variant="inline"
        icon={ChartBar}
        title="Sem período para comparar"
        description="A partir do segundo orçamento definido, você vê aqui se o centro costuma respeitar o teto."
        className={cn("py-8", className)}
      />
    )
  }

  return (
    <div className={cn("h-36 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <ReferenceLine
            y={100}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11.5 }}
            dy={4}
          />

          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={<HistoryTooltip />}
          />

          <Bar
            dataKey="percent"
            radius={[4, 4, 0, 0]}
            maxBarSize={44}
            isAnimationActive={animate}
            animationBegin={200}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={
                  entry.overBudget
                    ? "var(--chart-4)"
                    : entry.current
                      ? "var(--chart-1)"
                      : "color-mix(in oklch, var(--chart-1), var(--card) 62%)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function HistoryTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: {
    payload: {
      label: string
      percent: number
      committedCents: string
      totalCents: string
    }
  }[]
}) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-sm">
      <p className="text-caption text-muted-foreground">{item.label}</p>
      <p className="mt-0.5 text-body font-medium text-foreground tabular-nums">
        {formatCents(item.committedCents)}
      </p>
      <p className="text-caption text-muted-foreground tabular-nums">
        {item.percent}% de {formatCents(item.totalCents)}
      </p>
    </div>
  )
}
