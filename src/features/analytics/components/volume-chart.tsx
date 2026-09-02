import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { DailyVolume } from "@/api/analytics"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

const SERIES = [
  { key: "created", label: "Abertos", color: "var(--chart-1)" },
  { key: "finalized", label: "Decididos", color: "var(--chart-2)" },
] as const

const WEEKLY_ABOVE_DAYS = 45

interface Bucket {
  key: string
  label: string
  range: string
  created: number
  finalized: number
}

function parse(day: string): Date {
  return new Date(`${day}T12:00:00`)
}

function short(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function toBuckets(data: DailyVolume[]): { buckets: Bucket[]; weekly: boolean } {
  const weekly = data.length > WEEKLY_ABOVE_DAYS

  if (!weekly) {
    return {
      weekly,
      buckets: data.map((item) => {
        const date = parse(item.day)

        return {
          key: item.day,
          label: short(date),
          range: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
          }),
          created: item.created,
          finalized: item.finalized,
        }
      }),
    }
  }

  const groups = new Map<string, Bucket>()

  for (const item of data) {
    const date = parse(item.day)
    const monday = new Date(date)
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))

    const key = monday.toISOString().slice(0, 10)
    const current = groups.get(key)

    if (current) {
      current.created += item.created
      current.finalized += item.finalized
      continue
    }

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    groups.set(key, {
      key,
      label: short(monday),
      range: `${short(monday)} a ${short(sunday)}`,
      created: item.created,
      finalized: item.finalized,
    })
  }

  return { weekly, buckets: [...groups.values()] }
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload?: Bucket }[]
}) {
  const bucket = payload?.[0]?.payload

  if (!active || !bucket) {
    return null
  }

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xs">
      <p className="text-caption font-medium text-foreground">{bucket.range}</p>

      <div className="mt-1.5 flex flex-col gap-1">
        {SERIES.map((series) => (
          <p
            key={series.key}
            className="flex items-center gap-2 text-caption text-muted-foreground"
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-xs"
              style={{ background: series.color }}
            />
            {series.label}
            <span className="ml-auto pl-4 tabular-nums text-foreground">
              {bucket[series.key]}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}

export function VolumeChart({ data }: { data: DailyVolume[] }) {
  const reduced = usePrefersReducedMotion()
  const { buckets, weekly } = toBuckets(data)

  const busiest = buckets.reduce(
    (max, bucket) => Math.max(max, bucket.created, bucket.finalized),
    0,
  )

  const opened = buckets.reduce((sum, bucket) => sum + bucket.created, 0)
  const closed = buckets.reduce((sum, bucket) => sum + bucket.finalized, 0)
  const gap = opened - closed

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {SERIES.map((series) => (
          <span
            key={series.key}
            className="flex items-center gap-1.5 text-caption text-muted-foreground"
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-xs"
              style={{ background: series.color }}
            />
            {series.label}
          </span>
        ))}

        <span className="ml-auto text-caption text-muted-foreground">
          {opened === 0 ? (
            "Nenhum pedido no período"
          ) : gap > 0 ? (
            <>
              <span className="tabular-nums text-warning-strong">{gap}</span> a
              mais entraram do que saíram
            </>
          ) : gap < 0 ? (
            <>
              A fila encolheu{" "}
              <span className="tabular-nums text-brand-accent-strong">
                {Math.abs(gap)}
              </span>
            </>
          ) : (
            "Entrou e saiu na mesma medida"
          )}
        </span>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={buckets}
            barGap={2}
            margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.7}
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />

            <YAxis
              allowDecimals={false}
              domain={[0, Math.max(4, busiest + 1)]}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--muted)", fillOpacity: 0.6 }}
            />

            {SERIES.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                fill={series.color}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
                isAnimationActive={!reduced}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-caption text-muted-foreground">
        {weekly ? "Agrupado por semana." : "Por dia."}
      </p>
    </div>
  )
}
