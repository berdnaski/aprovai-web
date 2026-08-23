import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ChartLine } from "@phosphor-icons/react"

import { EmptyState } from "@/components/shared/empty-state"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

export interface BurndownPoint {
  label: string
  committedCents: number
}

export function BudgetBurndown({
  data,
  totalCents,
  className,
}: {
  data: BurndownPoint[]
  totalCents: string
  className?: string
}) {
  const animate = !usePrefersReducedMotion()

  const total = Number(totalCents)
  const last = data.at(-1)?.committedCents ?? 0
  const overBudget = last > total

  const tone = overBudget ? "var(--chart-4)" : "var(--chart-1)"
  const max = Math.max(total, last) * 1.08

  if (data.length === 0) {
    return (
      <EmptyState
        variant="inline"
        icon={ChartLine}
        title="Ainda sem consumo neste período"
        description="Cada pedido aprovado vira um ponto nesta linha, mostrando se o ritmo cabe no teto até o fim do mês."
        className={className}
      />
    )
  }

  return (
    <div className={cn("h-52 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="burndown-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone} stopOpacity={0.16} />
              <stop offset="100%" stopColor={tone} stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11.5 }}
            dy={6}
            interval="preserveStartEnd"
            minTickGap={24}
          />

          <YAxis
            width={56}
            domain={[0, max]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11.5 }}
            tickFormatter={(value: number) =>
              `${Math.round(value / 100000)}k`
            }
          />

          <ReferenceLine
            y={total}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: "teto",
              position: "insideTopRight",
              fill: "var(--muted-foreground)",
              fontSize: 11.5,
              dy: -4,
            }}
          />

          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={<BurndownTooltip totalCents={total} />}
          />

          <Area
            type="monotone"
            dataKey="committedCents"
            stroke={tone}
            strokeWidth={2}
            fill="url(#burndown-fill)"
            dot={false}
            activeDot={{
              r: 4,
              fill: tone,
              stroke: "var(--card)",
              strokeWidth: 2,
            }}
            isAnimationActive={animate}
            animationBegin={120}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function BurndownTooltip({
  active,
  payload,
  label,
  totalCents,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  totalCents: number
}) {
  if (!active || !payload?.length) {
    return null
  }

  const value = payload[0].value
  const percent = totalCents > 0 ? Math.round((value / totalCents) * 100) : 0

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-sm">
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-body font-medium text-foreground tabular-nums">
        {formatCents(String(value))}
      </p>
      <p className="text-caption text-muted-foreground tabular-nums">
        {percent}% do teto comprometido
      </p>
    </div>
  )
}
