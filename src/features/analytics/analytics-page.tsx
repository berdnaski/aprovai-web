import {
  ArrowsClockwise,
  Clock,
  DownloadSimple,
  Hourglass,
  SealCheck,
  Stack,
  Warning,
} from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { ExportFormat } from "@/api/analytics"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard, useExportRequests } from "@/hooks/analytics/use-analytics"
import { formatHours } from "@/lib/duration"
import { formatCents } from "@/lib/money"
import { relativeTime } from "@/lib/relative-time"
import { RequestStatus } from "@/types/enums"

import { ConsumptionBars } from "./components/consumption-bars"
import { PanelEmpty } from "./components/panel-empty"
import { StatTile } from "./components/stat-tile"
import { VolumeChart } from "./components/volume-chart"

const RANGES = {
  "30": "Últimos 30 dias",
  "90": "Últimos 90 dias",
  "180": "Últimos 6 meses",
} as const

type Range = keyof typeof RANGES

function rangeToQuery(range: Range): { from: string; to: string } {
  const to = new Date()
  to.setHours(23, 59, 59, 999)

  const from = new Date(to)
  from.setDate(from.getDate() - Number(range))
  from.setHours(0, 0, 0, 0)

  return { from: from.toISOString(), to: to.toISOString() }
}

function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={
        "flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs " +
        (className ?? "")
      }
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-5 py-3.5">
        <h2 className="text-caption font-medium text-foreground">{title}</h2>
        {description ? (
          <p className="text-caption text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="ml-auto">{action}</div> : null}
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  )
}

export function AnalyticsPage() {
  const [range, setRange] = useState<Range>("90")

  const query = useMemo(() => rangeToQuery(range), [range])
  const dashboard = useDashboard(query)
  const exportRequests = useExportRequests()

  function download(format: ExportFormat) {
    exportRequests.mutate(
      { format, query },
      {
        onSuccess: (blob) => {
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement("a")
          anchor.href = url
          anchor.download = `pedidos.${format}`
          anchor.click()
          URL.revokeObjectURL(url)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  if (dashboard.isPending && !dashboard.data) {
    return (
      <div className="flex flex-col gap-5" aria-busy>
        <Skeleton className="h-8 w-44" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    )
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" />
        <LoadError
          message={getApiErrorMessage(dashboard.error)}
          onRetry={() => void dashboard.refetch()}
        />
      </div>
    )
  }

  const data = dashboard.data

  const pending = data.totals.find(
    (item) => item.status === RequestStatus.PENDING,
  )
  const approved = data.totals.find(
    (item) => item.status === RequestStatus.APPROVED,
  )

  const waiting = data.bottlenecks.reduce((sum, item) => sum + item.waiting, 0)
  const oldest = data.bottlenecks
    .map((item) => item.oldestSince)
    .filter((value): value is string => value !== null)
    .sort()[0]

  const decided = data.approvers.reduce((sum, item) => sum + item.decisions, 0)
  const weightedHours = data.approvers.reduce(
    (sum, item) => sum + item.averageHours * item.decisions,
    0,
  )
  const averageHours = decided > 0 ? weightedHours / decided : 0

  const budgeted = data.consumption.filter(
    (item) => BigInt(item.budgetCents) > 0n,
  )
  const overBudget = budgeted.filter((item) => item.usagePercent >= 100).length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Dashboard"
        description="Onde o dinheiro está parado, quem está segurando, e quanto o orçamento já comprometeu."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={range}
              onValueChange={(next) => setRange(next as Range)}
            >
              <SelectTrigger
                className="h-9 w-44 bg-card px-3"
                aria-label="Período"
              >
                <SelectValue>
                  {(value: Range) => RANGES[value] ?? RANGES["90"]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RANGES) as Range[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {RANGES[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              disabled={exportRequests.isPending}
              onClick={() => download("xlsx")}
              className="h-9 gap-1.5 bg-card font-medium"
            >
              <DownloadSimple size={14} aria-hidden />
              {exportRequests.isPending ? "Gerando…" : "Exportar"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={Hourglass}
          tone={waiting > 0 ? "attention" : "neutral"}
          label="Esperando decisão"
          value={String(pending?.total ?? 0)}
          unit={pending?.total === 1 ? "pedido" : "pedidos"}
          hint={
            oldest
              ? `O mais antigo espera desde ${relativeTime(oldest)}.`
              : "Nenhum pedido parado na fila."
          }
        />

        <StatTile
          icon={SealCheck}
          tone="positive"
          label="Aprovado no período"
          value={formatCents(approved?.amountCents ?? "0")}
          hint={`${approved?.total ?? 0} ${
            approved?.total === 1 ? "pedido aprovado" : "pedidos aprovados"
          }.`}
        />

        <StatTile
          icon={Clock}
          label="Tempo médio de decisão"
          value={decided > 0 ? formatHours(averageHours) : "—"}
          hint={
            decided > 0
              ? `Sobre ${decided} ${decided === 1 ? "decisão" : "decisões"} no período.`
              : "Ninguém decidiu nada no período."
          }
        />

        <StatTile
          icon={Stack}
          tone={overBudget > 0 ? "attention" : "neutral"}
          label="Centros com orçamento"
          value={String(budgeted.length)}
          unit={budgeted.length === 1 ? "centro" : "centros"}
          hint={
            overBudget > 0
              ? `${overBudget} ${overBudget === 1 ? "estourou" : "estouraram"} o teto.`
              : budgeted.length > 0
                ? "Todos dentro do teto."
                : "Nenhum teto definido ainda."
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title="Pedidos abertos e decididos"
          description="por dia"
        >
          <div className="px-5 py-4">
            <VolumeChart data={data.daily} />
          </div>
        </Panel>

        <Panel title="Consumo por centro de custo">
          <ConsumptionBars items={data.consumption} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Quem está segurando a fila"
          description={waiting > 0 ? `${waiting} esperando` : undefined}
        >
          {data.bottlenecks.length === 0 ? (
            <PanelEmpty
              icon={SealCheck}
              title="Fila limpa"
              description="Nenhum pedido está esperando decisão neste momento."
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {data.bottlenecks.map((item) => (
                <li
                  key={item.memberId}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-caption font-medium text-foreground">
                      {item.approverName}
                    </span>
                    {item.oldestSince ? (
                      <span className="text-micro text-muted-foreground">
                        parado {relativeTime(item.oldestSince)}
                      </span>
                    ) : null}
                  </span>

                  <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
                    <MoneyDisplay cents={item.amountCents} />
                  </span>

                  <span className="flex shrink-0 items-center gap-1.5 text-caption tabular-nums text-warning-strong">
                    <Warning size={13} weight="fill" aria-hidden />
                    {item.waiting}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Tempo de decisão por aprovador"
          description="média no período"
        >
          {data.approvers.length === 0 ? (
            <PanelEmpty
              icon={Clock}
              title="Nenhuma decisão no período"
              description="Quando alguém aprovar ou recusar um pedido, o tempo médio dela aparece aqui."
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {data.approvers.map((item) => (
                <li
                  key={item.memberId}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
                >
                  <span className="min-w-0 flex-1 truncate text-caption font-medium text-foreground">
                    {item.approverName}
                  </span>

                  <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
                    {item.decisions}{" "}
                    {item.decisions === 1 ? "decisão" : "decisões"}
                  </span>

                  <span className="shrink-0 text-caption tabular-nums text-foreground">
                    {formatHours(item.averageHours)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {data.repeated.length > 0 ? (
        <Panel
          title="Possíveis pedidos repetidos"
          description="mesmo solicitante, fornecedor e valor"
          action={
            <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <ArrowsClockwise size={13} aria-hidden />
              {data.repeated.length}
            </span>
          }
        >
          <ul className="divide-y divide-border/50">
            {data.repeated.map((item, index) => (
              <li
                key={`${item.requesterName}-${item.supplierName}-${index}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-caption text-foreground">
                  {item.requesterName}
                  <span className="text-muted-foreground">
                    {" "}
                    para {item.supplierName}
                  </span>
                </span>

                <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
                  <MoneyDisplay cents={item.amountCents} />
                </span>

                <span className="shrink-0 text-caption tabular-nums text-warning-strong">
                  {item.occurrences}×
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  )
}
