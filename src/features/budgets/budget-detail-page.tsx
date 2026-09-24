import { DownloadSimple, Receipt } from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { PageBreadcrumbs } from "@/components/shared/page-breadcrumbs"
import type { BudgetEntry } from "@/api/budgets"
import { getApiErrorMessage } from "@/api/client"
import { EmptyState } from "@/components/shared/empty-state"
import { MoneyDisplay } from "@/components/shared/money-display"
import { StatRow, StatTile } from "@/components/shared/stat-tile"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  StatusPill,
  localPage,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useBudget,
  useBudgetConsumption,
  useBudgetEntries,
  useExportBudgetEntries,
} from "@/hooks/budgets/use-budgets"
import { useCostCenter } from "@/hooks/cost-centers/use-cost-centers"
import { MembersError } from "@/features/members/components/members-error"
import { formatPeriodLabel } from "@/features/cost-centers/period"
import { BudgetEntryType } from "@/types/enums"
import { usePermissions } from "@/hooks/auth/use-permissions"

import { BudgetDocumentsCard } from "./components/budget-documents-card"

const PER_PAGE = 25

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { canManage } = usePermissions()
  const budgetQuery = useBudget(id)
  const entriesQuery = useBudgetEntries(id)
  const consumptionQuery = useBudgetConsumption(id)
  const exportCsv = useExportBudgetEntries()

  const budget = budgetQuery.data
  const costCenterQuery = useCostCenter(budget?.costCenterId)

  if (budgetQuery.isPending) {
    return <BudgetSkeleton />
  }

  if (budgetQuery.isError || !budget) {
    return (
      <MembersError
        title="Orçamento não encontrado"
        message={
          budgetQuery.error
            ? getApiErrorMessage(budgetQuery.error)
            : "Ele pode ter sido removido ou você não tem acesso a ele."
        }
        onRetry={() => void navigate("/centros-de-custo")}
      />
    )
  }

  const entries = entriesQuery.data ?? []
  const { items, meta } = localPage(entries, page, PER_PAGE)

  const consumed = entries
    .filter((entry) => entry.type === BudgetEntryType.CONSUMPTION)
    .reduce((sum, entry) => sum + BigInt(entry.amountCents), 0n)

  const reversed = entries
    .filter((entry) => entry.type === BudgetEntryType.REVERSAL)
    .reduce((sum, entry) => sum + BigInt(entry.amountCents), 0n)

  const committed = consumed - reversed
  const available = BigInt(budget.totalAmountCents) - committed
  const realized = BigInt(consumptionQuery.data?.realizedCents ?? 0)
  const variance = BigInt(budget.totalAmountCents) - realized

  const columns: DataTableColumn<BudgetEntry>[] = [
    {
      id: "date",
      header: "Data",
      width: "120px",
      cell: (entry) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {DATE.format(new Date(entry.occurredAt))}
        </span>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      width: "130px",
      cell: (entry) => (
        <StatusPill
          tone={entry.type === BudgetEntryType.REVERSAL ? "success" : "neutral"}
        >
          {entry.type === BudgetEntryType.REVERSAL ? "Estorno" : "Consumo"}
        </StatusPill>
      ),
    },
    {
      id: "description",
      header: "Movimento",
      cell: (entry) => (
        <span className="truncate text-caption text-foreground">
          {entry.description ?? "Pedido de compra"}
        </span>
      ),
    },
    {
      id: "request",
      header: "Pedido",
      hideBelow: "lg",
      width: "150px",
      cell: (entry) => (
        <Link
          to={`/pedidos/${entry.purchaseRequestId}`}
          className="truncate text-caption text-primary underline decoration-primary/30 underline-offset-3 transition-colors hover:decoration-primary"
          onClick={(event) => event.stopPropagation()}
        >
          ver pedido
        </Link>
      ),
    },
    {
      id: "amount",
      header: "Valor",
      align: "end",
      width: "140px",
      cell: (entry) => (
        <span
          className={
            entry.type === BudgetEntryType.REVERSAL
              ? "text-caption tabular-nums text-brand-accent-strong"
              : "text-caption tabular-nums text-foreground"
          }
        >
          {entry.type === BudgetEntryType.REVERSAL ? "+" : "−"}
          <MoneyDisplay cents={entry.amountCents} />
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumbs
        items={[
        { label: "Centros de Custo", to: "/centros-de-custo" },
        { label: costCenterQuery.data?.name ?? "Centro de Custo", to: `/centros-de-custo/${budget.costCenterId}` },
        { label: formatPeriodLabel(budget) },
        ]}
      />

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card px-5 py-4 shadow-xs lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <h1 className="text-heading text-foreground">
            {formatPeriodLabel(budget)}
          </h1>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Extrato do que entrou e saiu deste período.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={exportCsv.isPending || entries.length === 0}
          onClick={() =>
            exportCsv.mutate(budget.id, {
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }
          className="h-8 shrink-0 gap-1.5"
        >
          <DownloadSimple size={13} aria-hidden />
          {exportCsv.isPending ? "Gerando…" : "Exportar CSV"}
        </Button>
      </div>

      <StatRow className="xl:grid-cols-5">
        <StatTile
          label="Teto do período"
          value={<MoneyDisplay cents={budget.totalAmountCents} />}
        />
        <StatTile
          label="Comprometido"
          value={<MoneyDisplay cents={committed.toString()} />}
          hint={`${entries.length} ${entries.length === 1 ? "movimento" : "movimentos"}`}
        />
        <StatTile
          label="Disponível"
          value={<MoneyDisplay cents={available.toString()} />}
          tone={available < 0n ? "warning" : "neutral"}
          hint={available < 0n ? "o período estourou o teto" : undefined}
        />
        <StatTile
          label="Realizado"
          value={<MoneyDisplay cents={realized.toString()} />}
          hint="o que já saiu do caixa no período"
        />
        <StatTile
          label="Variação"
          value={<MoneyDisplay cents={variance.toString()} />}
          tone={variance < 0n ? "warning" : "neutral"}
          hint={variance < 0n ? "pagou acima do teto" : "teto menos realizado"}
        />
      </StatRow>

      <BudgetDocumentsCard
        budgetId={budget.id}
        canEdit={canManage("cost-centers")}
      />

      <DataTableShell
        title="Extrato"
        count={meta.total}
        footer={
          meta.totalPages > 1 ? (
            <DataTablePagination
              meta={meta}
              onPageChange={setPage}
              label="movimentos"
            />
          ) : undefined
        }
      >
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(entry) => entry.id}
          isLoading={entriesQuery.isPending}
          empty={
            <EmptyState
              variant="inline"
              icon={Receipt}
              title="Nenhum movimento ainda"
              description="Assim que um pedido consumir este orçamento, ele aparece aqui."
            />
          }
        />
      </DataTableShell>
    </div>
  )
}

function BudgetSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando orçamento</span>

      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-20 w-full rounded-lg" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  )
}
