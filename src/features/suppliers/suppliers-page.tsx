import {
  ArrowSquareOut,
  Buildings,
  MagnifyingGlass,
  Plus,
} from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { getApiErrorMessage } from "@/api/client"
import type { Supplier } from "@/api/suppliers"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  RowAction,
  StatusDot,
  TableSearch,
  TableSegments,
  TableToolbar,
  type DataTableColumn,
  type Tone,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatCnpj } from "@/lib/cnpj"
import {
  SUPPLIER_USAGE_LABELS,
  SupplierUsage,
  VALIDATION_STATUS_LABELS,
  ValidationStatus,
} from "@/types/enums"

import { CreateSupplierDialog } from "./components/create-supplier-dialog"
import { SuppliersError } from "./components/suppliers-error"

const PER_PAGE = 25

const FILTERS = {
  ALL: "ALL",
  BLOCKED: "BLOCKED",
  UNVERIFIED: "UNVERIFIED",
} as const

type Filter = (typeof FILTERS)[keyof typeof FILTERS]

function railFor(supplier: Supplier): Tone | undefined {
  if (supplier.blocked || supplier.usage === SupplierUsage.BLOCKS_SUBMISSION) {
    return "danger"
  }

  if (supplier.usage === SupplierUsage.BLOCKS_APPROVAL) {
    return "warning"
  }

  return undefined
}

function usageStateFor(supplier: Supplier): { tone: Tone; label: string } {
  if (supplier.usage === SupplierUsage.ALLOWED) {
    return { tone: "success", label: SUPPLIER_USAGE_LABELS.ALLOWED }
  }

  if (supplier.blocked) {
    return { tone: "danger", label: "Bloqueado" }
  }

  return supplier.usage === SupplierUsage.BLOCKS_APPROVAL
    ? { tone: "warning", label: SUPPLIER_USAGE_LABELS.BLOCKS_APPROVAL }
    : { tone: "danger", label: SUPPLIER_USAGE_LABELS.BLOCKS_SUBMISSION }
}

function validationStateFor(status: ValidationStatus): {
  tone: Tone
  label: string
} {
  if (status === ValidationStatus.VALIDATED) {
    return { tone: "neutral", label: VALIDATION_STATUS_LABELS.VALIDATED }
  }

  return status === ValidationStatus.FAILED
    ? { tone: "danger", label: VALIDATION_STATUS_LABELS.FAILED }
    : { tone: "warning", label: VALIDATION_STATUS_LABELS.PENDING }
}

export function SuppliersPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>(FILTERS.ALL)
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)

  const term = useDebouncedValue(query).trim().toLowerCase()
  const navigate = useNavigate()

  const { canManage } = usePermissions()
  const canEdit = canManage("suppliers")

  const suppliersQuery = useSuppliers({
    page,
    perPage: PER_PAGE,
    search: term || undefined,
    blocked: filter === FILTERS.BLOCKED ? true : undefined,
    validationStatus:
      filter === FILTERS.UNVERIFIED ? ValidationStatus.PENDING : undefined,
  })

  const totalQuery = useSuppliers({ page: 1, perPage: 1 })
  const blockedQuery = useSuppliers({ page: 1, perPage: 1, blocked: true })
  const unverifiedQuery = useSuppliers({
    page: 1,
    perPage: 1,
    validationStatus: ValidationStatus.PENDING,
  })

  if (suppliersQuery.isPending) {
    return <SuppliersSkeleton />
  }

  if (suppliersQuery.isError) {
    return (
      <SuppliersError
        message={getApiErrorMessage(suppliersQuery.error)}
        onRetry={() => void suppliersQuery.refetch()}
      />
    )
  }

  const { items, meta } = suppliersQuery.data ?? {
    items: [],
    meta: { total: 0, page: 1, perPage: PER_PAGE, totalPages: 1 },
  }

  const counts: Record<Filter, number> = {
    ALL: totalQuery.data?.meta.total ?? 0,
    BLOCKED: blockedQuery.data?.meta.total ?? 0,
    UNVERIFIED: unverifiedQuery.data?.meta.total ?? 0,
  }

  const columns: DataTableColumn<Supplier>[] = [
    {
      id: "name",
      header: "Fornecedor",
      cell: (supplier) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption font-medium text-foreground">
            {supplier.tradeName ?? supplier.legalName}
          </span>
          <span className="tabular truncate text-micro text-muted-foreground/70">
            {formatCnpj(supplier.cnpj)}
          </span>
        </span>
      ),
    },
    {
      id: "usage",
      header: "Situação",
      width: "160px",
      cell: (supplier) => {
        const usage = usageStateFor(supplier)
        return <StatusDot tone={usage.tone} label={usage.label} />
      },
    },
    {
      id: "validation",
      header: "Receita",
      hideBelow: "lg",
      width: "150px",
      cell: (supplier) => {
        const validation = validationStateFor(supplier.validationStatus)
        return <StatusDot tone={validation.tone} label={validation.label} />
      },
    },
    {
      id: "location",
      header: "Local",
      hideBelow: "xl",
      width: "160px",
      cell: (supplier) => (
        <span className="truncate text-caption text-muted-foreground">
          {supplier.city
            ? `${supplier.city}${supplier.state ? `/${supplier.state}` : ""}`
            : "—"}
        </span>
      ),
    },
  ]

  const newSupplierAction = canEdit ? (
    <Button
      size="lg"
      onClick={() => setCreating(true)}
      className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
    >
      <Plus size={15} weight="bold" aria-hidden />
      Novo fornecedor
    </Button>
  ) : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fornecedores"
        description="De quem a empresa compra. Um fornecedor bloqueado ou com pendência na Receita trava o pedido antes de ele virar despesa."
        action={newSupplierAction}
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
              { id: FILTERS.ALL, label: "Todos", count: counts.ALL },
              {
                id: FILTERS.BLOCKED,
                label: "Com trava",
                count: counts.BLOCKED,
                tone: "danger",
              },
              {
                id: FILTERS.UNVERIFIED,
                label: "Sem conferir",
                count: counts.UNVERIFIED,
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
            placeholder="Buscar por nome ou CNPJ"
            label="Buscar fornecedor"
            className="ml-auto"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="fornecedores"
              />
            ) : (
              <p className="tabular text-caption text-muted-foreground">
                {meta.total} {meta.total === 1 ? "fornecedor" : "fornecedores"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(supplier) => supplier.id}
            rowAccent={railFor}
            onRowClick={(supplier) =>
              void navigate(`/fornecedores/${supplier.id}`)
            }
            rowActions={(supplier) => (
              <RowAction
                icon={ArrowSquareOut}
                label={`Abrir ${supplier.tradeName ?? supplier.legalName}`}
                onClick={() => void navigate(`/fornecedores/${supplier.id}`)}
              />
            )}
            empty={
              <EmptyState
                variant="inline"
                icon={
                  term || filter !== FILTERS.ALL ? MagnifyingGlass : Buildings
                }
                title={
                  term || filter !== FILTERS.ALL
                    ? "Nenhum fornecedor encontrado"
                    : "Nenhum fornecedor ainda"
                }
                description={
                  term || filter !== FILTERS.ALL
                    ? "Tente outro termo ou volte para todos."
                    : "Sem fornecedor cadastrado, ninguém consegue abrir um pedido de compra."
                }
                action={
                  term || filter !== FILTERS.ALL ? undefined : newSupplierAction
                }
              />
            }
          />
        </DataTableShell>
      </section>

      <CreateSupplierDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

function SuppliersSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando fornecedores</span>

      <div>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-3 h-4 w-96" />
      </div>

      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  )
}
