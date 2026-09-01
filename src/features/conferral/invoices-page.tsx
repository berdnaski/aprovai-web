import { MagnifyingGlass, Receipt, UploadSimple } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import type { Invoice } from "@/api/invoices"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
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
import { useInvoices } from "@/hooks/invoices/use-invoices"
import { usePurchaseOrders } from "@/hooks/purchase-orders/use-purchase-orders"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatCnpj } from "@/lib/cnpj"
import { INVOICE_STATUS } from "@/lib/status-labels"
import { InvoiceStatus } from "@/types/enums"

import { ConferralHeader } from "./components/conferral-header"
import { ScopeNote } from "./components/scope-note"
import { UploadInvoiceDialog } from "./components/upload-invoice-dialog"

const PER_PAGE = 25

const FILTERS = {
  ALL: "ALL",
  DIVERGENT: "DIVERGENT",
  UNLINKED: "UNLINKED",
} as const

type Filter = (typeof FILTERS)[keyof typeof FILTERS]

export function InvoicesPage() {
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>(FILTERS.ALL)
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)

  const search = useDebouncedValue(query).trim()

  const invoicesQuery = useInvoices({
    page,
    perPage: PER_PAGE,
    ...(search ? { search } : {}),
    ...(filter === FILTERS.DIVERGENT
      ? { status: [InvoiceStatus.DIVERGENT] }
      : {}),
    ...(filter === FILTERS.UNLINKED ? { unlinkedOnly: true } : {}),
  })

  const divergentCount = useInvoices({
    perPage: 1,
    status: [InvoiceStatus.DIVERGENT],
  })
  const unlinkedCount = useInvoices({ perPage: 1, unlinkedOnly: true })
  const ordersQuery = usePurchaseOrders({ perPage: 100 })

  const orderNumber = new Map(
    (ordersQuery.data?.items ?? []).map((order) => [order.id, order.number]),
  )

  const columns: DataTableColumn<Invoice>[] = [
    {
      id: "number",
      header: "Nota",
      cell: (invoice) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption font-medium tabular-nums text-foreground">
            {invoice.number}
            {invoice.series ? `-${invoice.series}` : ""}
          </span>
          <span className="truncate text-micro text-muted-foreground/70">
            {invoice.issuerName}
          </span>
        </span>
      ),
    },
    {
      id: "issuer",
      header: "CNPJ emitente",
      hideBelow: "xl",
      width: "170px",
      cell: (invoice) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {formatCnpj(invoice.issuerCnpj)}
        </span>
      ),
    },
    {
      id: "order",
      header: "Ordem",
      hideBelow: "lg",
      width: "150px",
      cell: (invoice) =>
        invoice.purchaseOrderId ? (
          <span className="text-caption tabular-nums text-muted-foreground">
            {orderNumber.get(invoice.purchaseOrderId) ?? "Vinculada"}
          </span>
        ) : (
          <StatusPill tone="warning">Sem vínculo</StatusPill>
        ),
    },
    {
      id: "status",
      header: "Situação",
      width: "150px",
      cell: (invoice) => (
        <StatusBadge map={INVOICE_STATUS} value={invoice.status} />
      ),
    },
    {
      id: "total",
      header: "Valor",
      align: "end",
      width: "130px",
      cell: (invoice) => (
        <MoneyDisplay cents={invoice.totalAmountCents} emphasis />
      ),
    },
  ]

  if (invoicesQuery.isPending && !invoicesQuery.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <ConferralHeader tab="invoices" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (invoicesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <ConferralHeader tab="invoices" />
        <LoadError onRetry={() => void invoicesQuery.refetch()} />
      </div>
    )
  }

  const rows = invoicesQuery.data?.items ?? []
  const meta = invoicesQuery.data?.meta
  const filtered = search.length > 0 || filter !== FILTERS.ALL

  const uploadAction = (
    <Button
      size="lg"
      onClick={() => setUploading(true)}
      className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
    >
      <UploadSimple size={15} aria-hidden />
      Enviar nota
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <ConferralHeader tab="invoices" action={uploadAction} />

      <ScopeNote />

      <section>
        <TableToolbar>
          <TableSegments
            value={filter}
            onChange={(next) => {
              setFilter(next)
              setPage(1)
            }}
            segments={[
              { id: FILTERS.ALL, label: "Todas" },
              {
                id: FILTERS.DIVERGENT,
                label: "Com divergência",
                count: divergentCount.data?.meta.total,
                tone: "warning",
              },
              {
                id: FILTERS.UNLINKED,
                label: "Sem vínculo",
                count: unlinkedCount.data?.meta.total,
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
            label="Buscar nota fiscal"
            className="ml-auto"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="notas"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0} {meta?.total === 1 ? "nota" : "notas"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(invoice) => invoice.id}
            onRowClick={(invoice) =>
              navigate(`/conferencia/notas/${invoice.id}`)
            }
            rowAccent={(invoice) =>
              invoice.status === InvoiceStatus.DIVERGENT
                ? "warning"
                : invoice.status === InvoiceStatus.REJECTED
                  ? "danger"
                  : undefined
            }
            empty={
              <EmptyState
                variant="inline"
                icon={filtered ? MagnifyingGlass : Receipt}
                title={
                  filtered ? "Nenhuma nota encontrada" : "Nenhuma nota fiscal"
                }
                description={
                  filtered
                    ? "Tente outro termo ou troque o filtro."
                    : "Envie o XML que o fornecedor mandou para conferir contra a ordem."
                }
                action={filtered ? undefined : uploadAction}
              />
            }
          />
        </DataTableShell>
      </section>

      <UploadInvoiceDialog open={uploading} onOpenChange={setUploading} />
    </div>
  )
}
