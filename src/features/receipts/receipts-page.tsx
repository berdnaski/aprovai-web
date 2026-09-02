import { MagnifyingGlass, Truck } from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import type { Receipt } from "@/api/receipts"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  StatusPill,
  TableSearch,
  TableSegments,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useReceipts } from "@/hooks/receipts/use-receipts"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { RECEIPT_STATUS } from "@/lib/status-labels"

const PER_PAGE = 25

const FILTERS = { ALL: "ALL", DIVERGENT: "DIVERGENT" } as const

type Filter = (typeof FILTERS)[keyof typeof FILTERS]

function receivedOn(value: string): { day: string; time: string } {
  const date = new Date(value)

  return {
    day: date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

function countRejected(receipt: Receipt): number {
  return (receipt.items ?? []).filter(
    (item) => Number(item.rejectedQuantity) > 0,
  ).length
}

export function ReceiptsPage() {
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>(FILTERS.ALL)
  const [page, setPage] = useState(1)

  const search = useDebouncedValue(query).trim()

  const listQuery = useMemo(
    () => ({
      page,
      perPage: PER_PAGE,
      ...(search ? { search } : {}),
      ...(filter === FILTERS.DIVERGENT ? { divergentOnly: true } : {}),
    }),
    [page, search, filter],
  )

  const receipts = useReceipts(listQuery)
  const divergentCount = useReceipts(
    useMemo(() => ({ perPage: 1, divergentOnly: true }), []),
  )

  const columns: DataTableColumn<Receipt>[] = [
    {
      id: "number",
      header: "Recebimento",
      cell: (receipt) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption font-medium tabular-nums text-foreground">
            {receipt.number}
          </span>
          <span className="truncate text-micro tabular-nums text-muted-foreground/70">
            {receipt.purchaseOrderNumber ?? "Ordem de compra"}
          </span>
        </span>
      ),
    },
    {
      id: "received",
      header: "Chegou em",
      width: "150px",
      cell: (receipt) => {
        const { day, time } = receivedOn(receipt.receivedAt)

        return (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-caption tabular-nums text-foreground">
              {day}
            </span>
            <span className="text-micro tabular-nums text-muted-foreground/70">
              {time}
            </span>
          </span>
        )
      },
    },
    {
      id: "by",
      header: "Quem recebeu",
      hideBelow: "lg",
      width: "180px",
      cell: (receipt) => (
        <span className="truncate text-caption text-muted-foreground">
          {receipt.receivedByName ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      width: "150px",
      cell: (receipt) => (
        <StatusBadge map={RECEIPT_STATUS} value={receipt.status} />
      ),
    },
    {
      id: "divergence",
      header: "Recusas",
      align: "end",
      width: "130px",
      cell: (receipt) => {
        const rejected = countRejected(receipt)

        return receipt.hasDivergence ? (
          <StatusPill tone="warning">
            {rejected > 0
              ? `${rejected} ${rejected === 1 ? "item" : "itens"}`
              : "Com recusa"}
          </StatusPill>
        ) : (
          <span className="text-caption text-muted-foreground/60">—</span>
        )
      },
    },
  ]

  if (receipts.isPending && !receipts.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (receipts.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Recebimentos" />
        <LoadError onRetry={() => void receipts.refetch()} />
      </div>
    )
  }

  const rows = receipts.data?.items ?? []
  const meta = receipts.data?.meta
  const filtered = search.length > 0 || filter !== FILTERS.ALL

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Recebimentos"
        description="Tudo que chegou do fornecedor, e o que foi recusado na conferência da entrega."
      />

      <section>
        <TableToolbar>
          <TableSegments
            value={filter}
            onChange={(next) => {
              setFilter(next)
              setPage(1)
            }}
            segments={[
              { id: FILTERS.ALL, label: "Todos" },
              {
                id: FILTERS.DIVERGENT,
                label: "Com recusa",
                count: divergentCount.data?.meta.total,
                tone: "warning",
              },
            ]}
          />

          <TableSearch
            value={query}
            onChange={(next) => {
              setQuery(next)
              setPage(1)
            }}
            placeholder="Buscar por número"
            label="Buscar recebimento"
            className="ml-auto"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="recebimentos"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0}{" "}
                {meta?.total === 1 ? "recebimento" : "recebimentos"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(receipt) => receipt.id}
            onRowClick={(receipt) => navigate(`/recebimentos/${receipt.id}`)}
            rowAccent={(receipt) =>
              receipt.hasDivergence ? "warning" : undefined
            }
            empty={
              <EmptyState
                variant="inline"
                icon={filtered ? MagnifyingGlass : Truck}
                title={
                  filtered
                    ? "Nenhum recebimento encontrado"
                    : "Nada recebido ainda"
                }
                description={
                  filtered
                    ? "Tente outro número ou troque o filtro."
                    : "O recebimento é registrado a partir da ordem de compra, quando a mercadoria chega."
                }
              />
            }
          />
        </DataTableShell>
      </section>
    </div>
  )
}
