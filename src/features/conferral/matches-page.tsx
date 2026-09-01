import { Scales } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import type { MatchResult } from "@/api/matching"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  TableSegments,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useInvoices } from "@/hooks/invoices/use-invoices"
import { useMatchResults } from "@/hooks/matching/use-matching"
import { usePurchaseOrders } from "@/hooks/purchase-orders/use-purchase-orders"
import { MATCH_STATUS } from "@/lib/status-labels"
import { MatchStatus } from "@/types/enums"

import { ConferralHeader } from "./components/conferral-header"

const PER_PAGE = 25

const FILTERS = {
  DIVERGENT: "DIVERGENT",
  ALL: "ALL",
} as const

type Filter = (typeof FILTERS)[keyof typeof FILTERS]

export function MatchesPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>(FILTERS.DIVERGENT)
  const [page, setPage] = useState(1)

  const matchesQuery = useMatchResults({
    page,
    perPage: PER_PAGE,
    ...(filter === FILTERS.DIVERGENT
      ? { status: [MatchStatus.DIVERGENT] }
      : {}),
  })

  const divergentCount = useMatchResults({
    perPage: 1,
    status: [MatchStatus.DIVERGENT],
  })
  const ordersQuery = usePurchaseOrders({ perPage: 100 })
  const invoicesQuery = useInvoices({ perPage: 100 })

  const orderNumber = new Map(
    (ordersQuery.data?.items ?? []).map((order) => [order.id, order.number]),
  )
  const invoiceNumber = new Map(
    (invoicesQuery.data?.items ?? []).map((invoice) => [
      invoice.id,
      invoice.number,
    ]),
  )

  const columns: DataTableColumn<MatchResult>[] = [
    {
      id: "invoice",
      header: "Nota",
      cell: (result) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption font-medium tabular-nums text-foreground">
            {invoiceNumber.get(result.invoiceId) ?? "Nota fiscal"}
          </span>
          <span className="truncate text-micro tabular-nums text-muted-foreground/70">
            {orderNumber.get(result.purchaseOrderId) ?? "Ordem"}
          </span>
        </span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      width: "160px",
      cell: (result) => (
        <StatusBadge map={MATCH_STATUS} value={result.status} />
      ),
    },
    {
      id: "divergences",
      header: "Divergências",
      align: "end",
      hideBelow: "lg",
      width: "120px",
      cell: (result) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {result.divergences?.length ?? 0}
        </span>
      ),
    },
    {
      id: "ordered",
      header: "Pedido",
      align: "end",
      hideBelow: "xl",
      width: "120px",
      cell: (result) => <MoneyDisplay cents={result.orderedAmountCents} />,
    },
    {
      id: "invoiced",
      header: "Faturado",
      align: "end",
      width: "130px",
      cell: (result) => (
        <MoneyDisplay cents={result.invoicedAmountCents} emphasis />
      ),
    },
  ]

  if (matchesQuery.isPending && !matchesQuery.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <ConferralHeader tab="results" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (matchesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <ConferralHeader tab="results" />
        <LoadError onRetry={() => void matchesQuery.refetch()} />
      </div>
    )
  }

  const rows = matchesQuery.data?.items ?? []
  const meta = matchesQuery.data?.meta

  return (
    <div className="flex flex-col gap-6">
      <ConferralHeader tab="results" />

      <section>
        <TableToolbar>
          <TableSegments
            value={filter}
            onChange={(next) => {
              setFilter(next)
              setPage(1)
            }}
            segments={[
              {
                id: FILTERS.DIVERGENT,
                label: "Precisam de você",
                count: divergentCount.data?.meta.total,
                tone: "warning",
              },
              { id: FILTERS.ALL, label: "Todas" },
            ]}
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="conferências"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0}{" "}
                {meta?.total === 1 ? "conferência" : "conferências"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(result) => result.id}
            onRowClick={(result) => navigate(`/conferencia/resultado/${result.id}`)}
            rowAccent={(result) =>
              result.status === MatchStatus.DIVERGENT ? "warning" : undefined
            }
            empty={
              <EmptyState
                variant="inline"
                icon={Scales}
                title={
                  filter === FILTERS.DIVERGENT
                    ? "Nada para revisar"
                    : "Nenhuma conferência ainda"
                }
                description={
                  filter === FILTERS.DIVERGENT
                    ? "Toda nota conferida até agora bateu com a ordem."
                    : "A conferência roda quando uma nota é vinculada a uma ordem."
                }
              />
            }
          />
        </DataTableShell>
      </section>
    </div>
  )
}
