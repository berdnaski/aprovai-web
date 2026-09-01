import { MagnifyingGlass, ShoppingCart } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import type { PurchaseOrder } from "@/api/purchase-orders"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  TableSearch,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usePurchaseOrders } from "@/hooks/purchase-orders/use-purchase-orders"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { PURCHASE_ORDER_STATUS } from "@/lib/status-labels"
import { cn } from "@/lib/utils"
import { PurchaseOrderStatus } from "@/types/enums"

const PER_PAGE = 25

const STATUSES: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.ISSUED,
  PurchaseOrderStatus.SENT,
  PurchaseOrderStatus.PARTIALLY_RECEIVED,
  PurchaseOrderStatus.RECEIVED,
  PurchaseOrderStatus.CLOSED,
  PurchaseOrderStatus.CANCELED,
]

function dateLabel(value: string | null): string {
  if (!value) {
    return "—"
  }

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

export function OrdersPage() {
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<PurchaseOrderStatus | null>(null)
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const search = useDebouncedValue(query).trim()
  const suppliersQuery = useSuppliers({ perPage: 100 })
  const suppliers = suppliersQuery.data?.items ?? []

  const ordersQuery = usePurchaseOrders({
    page,
    perPage: PER_PAGE,
    ...(search ? { search } : {}),
    ...(status ? { status: [status] } : {}),
    ...(supplierId ? { supplierId } : {}),
  })

  const supplierName = new Map(
    suppliers.map((item) => [item.id, item.tradeName ?? item.legalName]),
  )

  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: "number",
      header: "Ordem",
      cell: (order) => (
        <span className="text-caption font-medium tabular-nums text-foreground">
          {order.number}
        </span>
      ),
    },
    {
      id: "supplier",
      header: "Fornecedor",
      cell: (order) => (
        <span className="truncate text-caption text-muted-foreground">
          {supplierName.get(order.supplierId) ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      width: "170px",
      cell: (order) => (
        <StatusBadge map={PURCHASE_ORDER_STATUS} value={order.status} />
      ),
    },
    {
      id: "total",
      header: "Valor",
      align: "end",
      width: "130px",
      cell: (order) => (
        <MoneyDisplay cents={order.totalAmountCents} emphasis />
      ),
    },
    {
      id: "issuedAt",
      header: "Emitida",
      align: "end",
      hideBelow: "lg",
      width: "100px",
      cell: (order) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {dateLabel(order.issuedAt)}
        </span>
      ),
    },
    {
      id: "delivery",
      header: "Entrega",
      align: "end",
      hideBelow: "xl",
      width: "100px",
      cell: (order) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {dateLabel(order.expectedDeliveryAt)}
        </span>
      ),
    },
  ]

  if (ordersQuery.isPending && !ordersQuery.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <div>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="mt-3 h-4 w-80" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (ordersQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Ordens de compra" />
        <LoadError onRetry={() => void ordersQuery.refetch()} />
      </div>
    )
  }

  const rows = ordersQuery.data?.items ?? []
  const meta = ordersQuery.data?.meta
  const filtered = Boolean(search || status || supplierId)

  const triggerClass = (active: boolean) =>
    cn(
      "h-8 w-44 gap-1.5 px-2.5 text-caption",
      active
        ? "border-primary/25 bg-primary/6 text-primary"
        : "border-border bg-card text-muted-foreground",
    )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ordens de compra"
        description="O que já foi formalizado com o fornecedor, depois da aprovação."
      />

      <section>
        <TableToolbar>
          <Select
            value={status}
            onValueChange={(next) => {
              setStatus((next ?? null) as PurchaseOrderStatus | null)
              setPage(1)
            }}
          >
            <SelectTrigger
              className={triggerClass(status !== null)}
              aria-label="Filtrar por situação"
            >
              <SelectValue>
                {(picked: string | null) =>
                  picked ? PURCHASE_ORDER_STATUS[picked].label : "Situação"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todas as situações</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {PURCHASE_ORDER_STATUS[item].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={supplierId}
            onValueChange={(next) => {
              setSupplierId((next ?? null) as string | null)
              setPage(1)
            }}
          >
            <SelectTrigger
              className={triggerClass(supplierId !== null)}
              aria-label="Filtrar por fornecedor"
            >
              <SelectValue>
                {(picked: string | null) =>
                  picked ? (supplierName.get(picked) ?? "Fornecedor") : "Fornecedor"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todos os fornecedores</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.tradeName ?? supplier.legalName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TableSearch
            value={query}
            onChange={(next) => {
              setQuery(next)
              setPage(1)
            }}
            placeholder="Buscar por número"
            label="Buscar ordem"
            className="ml-auto"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="ordens"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0} {meta?.total === 1 ? "ordem" : "ordens"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(order) => order.id}
            onRowClick={(order) => navigate(`/ordens-de-compra/${order.id}`)}
            empty={
              <EmptyState
                variant="inline"
                icon={filtered ? MagnifyingGlass : ShoppingCart}
                title={
                  filtered
                    ? "Nenhuma ordem encontrada"
                    : "Nenhuma ordem emitida"
                }
                description={
                  filtered
                    ? "Tente outro termo ou limpe os filtros."
                    : "A ordem nasce de um pedido aprovado, na tela do pedido."
                }
              />
            }
          />
        </DataTableShell>
      </section>
    </div>
  )
}
