import { FileText, MagnifyingGlass, Plus } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import type { PurchaseRequest } from "@/api/purchase-requests"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  CellPerson,
  DataTable,
  DataTablePagination,
  DataTableShell,
  TableSearch,
  TableSegments,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useCategories } from "@/hooks/categories/use-categories"
import { useMembers } from "@/hooks/members/use-members"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import { usePurchaseRequests } from "@/hooks/purchase-requests/use-purchase-requests"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { initialsOf, displayName } from "@/lib/people"
import { REQUEST_STATUS } from "@/lib/status-labels"
import { RequestView } from "@/types/enums"

import { RequestFilters, type Filters } from "./components/request-filters"
import { UrgencyMark } from "./components/urgency-mark"

const PER_PAGE = 25

export function RequestsPage() {
  const navigate = useNavigate()
  const { isFinanceAdmin, isApprover } = usePermissions()

  const [view, setView] = useState<RequestView>(RequestView.MINE)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Filters>({})

  const search = useDebouncedValue(query).trim()
  const decides = isApprover || isFinanceAdmin

  const requestsQuery = usePurchaseRequests({
    view,
    page,
    perPage: PER_PAGE,
    ...(search ? { search } : {}),
    ...filters,
  })

  const pendingCount = usePurchaseRequests({
    view: RequestView.PENDING_FOR_ME,
    perPage: 1,
  })

  const { data: costCenters = [] } = useCostCenters()
  const { data: categories = [] } = useCategories()
  const { data: members = [] } = useMembers()
  const suppliersQuery = useSuppliers({ perPage: 100 })

  const costCenterName = new Map(costCenters.map((cc) => [cc.id, cc.name]))
  const memberName = new Map(
    members.map((member) => [member.id, displayName(member)]),
  )

  function reset(next: Partial<{ view: RequestView; filters: Filters }>) {
    setPage(1)
    if (next.view) {
      setView(next.view)
    }
    if (next.filters) {
      setFilters(next.filters)
    }
  }

  const columns: DataTableColumn<PurchaseRequest>[] = [
    {
      id: "number",
      header: "Pedido",
      cell: (request) => (
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5">
            <UrgencyMark urgency={request.urgency} />
            <span className="truncate text-caption font-medium text-foreground">
              {request.title}
            </span>
          </span>
          <span className="truncate text-micro tabular-nums text-muted-foreground/70">
            {request.number}
          </span>
        </span>
      ),
    },
    {
      id: "costCenter",
      header: "Centro de Custo",
      hideBelow: "lg",
      width: "180px",
      cell: (request) => (
        <span className="truncate text-caption text-muted-foreground">
          {costCenterName.get(request.costCenterId) ?? "—"}
        </span>
      ),
    },
    {
      id: "requester",
      header: "Solicitante",
      hideBelow: "xl",
      width: "170px",
      cell: (request) => {
        const person = memberName.get(request.requesterId)

        return person ? (
          <CellPerson initials={initialsOf(person)} name={person} />
        ) : (
          <span className="text-caption text-muted-foreground">—</span>
        )
      },
    },
    {
      id: "status",
      header: "Situação",
      width: "150px",
      cell: (request) => (
        <StatusBadge map={REQUEST_STATUS} value={request.status} />
      ),
    },
    {
      id: "total",
      header: "Valor",
      align: "end",
      width: "130px",
      cell: (request) => (
        <MoneyDisplay cents={request.totalAmountCents} emphasis />
      ),
    },
    {
      id: "createdAt",
      header: "Aberto em",
      align: "end",
      hideBelow: "lg",
      width: "110px",
      cell: (request) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {new Date(request.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      ),
    },
  ]

  if (requestsQuery.isPending && !requestsQuery.data) {
    return <RequestsSkeleton />
  }

  if (requestsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Pedidos" />
        <LoadError
          message="Não foi possível carregar os pedidos."
          onRetry={() => void requestsQuery.refetch()}
        />
      </div>
    )
  }

  const rows = requestsQuery.data?.items ?? []
  const meta = requestsQuery.data?.meta
  const filtered = search.length > 0 || Object.keys(filters).length > 0

  const newRequest = (
    <Button
      size="lg"
      onClick={() => navigate("/pedidos/novo")}
      className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
    >
      <Plus size={15} weight="bold" aria-hidden />
      Novo pedido
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pedidos"
        description="Tudo que a empresa comprou ou pediu para comprar."
        action={newRequest}
      />

      <section>
        <TableToolbar>
          <TableSegments
            value={view}
            onChange={(next) => reset({ view: next })}
            segments={[
              { id: RequestView.MINE, label: "Meus pedidos" },
              ...(decides
                ? [
                    {
                      id: RequestView.PENDING_FOR_ME,
                      label: "Aguardam você",
                      count: pendingCount.data?.meta.total,
                      tone: "warning" as const,
                    },
                  ]
                : []),
              { id: RequestView.ALL, label: "Todos" },
            ]}
          />

          <TableSearch
            value={query}
            onChange={(next) => {
              setQuery(next)
              setPage(1)
            }}
            placeholder="Buscar por número ou título"
            label="Buscar pedido"
            className="ml-auto"
          />
        </TableToolbar>

        <RequestFilters
          value={filters}
          onChange={(next) => reset({ filters: next })}
          costCenters={costCenters}
          categories={categories}
          suppliers={suppliersQuery.data?.items ?? []}
        />

        <DataTableShell
          className="mt-3"
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="pedidos"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0} {meta?.total === 1 ? "pedido" : "pedidos"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(request) => request.id}
            isLoading={requestsQuery.isFetching && rows.length === 0}
            onRowClick={(request) => navigate(`/pedidos/${request.id}`)}
            empty={
              <EmptyState
                variant="inline"
                icon={filtered ? MagnifyingGlass : FileText}
                title={
                  filtered
                    ? "Nenhum pedido encontrado"
                    : view === RequestView.PENDING_FOR_ME
                      ? "Nada aguardando você"
                      : "Nenhum pedido ainda"
                }
                description={
                  filtered
                    ? "Tente outro termo ou limpe os filtros."
                    : view === RequestView.PENDING_FOR_ME
                      ? "Quando um pedido chegar na sua alçada, ele aparece aqui."
                      : "O primeiro pedido começa como rascunho. Nada é notificado até você enviar."
                }
                action={
                  filtered || view === RequestView.PENDING_FOR_ME
                    ? undefined
                    : newRequest
                }
              />
            }
          />
        </DataTableShell>
      </section>
    </div>
  )
}

function RequestsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando pedidos</span>

      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-3 h-4 w-80" />
      </div>

      <Skeleton className="h-9 w-72 rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}
