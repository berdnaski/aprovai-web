import {
  ArrowCounterClockwise,
  Archive,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Tag,
} from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import type { Category } from "@/api/categories"
import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
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
  localPage,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/auth/use-permissions"
import {
  useCategories,
  useSetCategoryActive,
} from "@/hooks/categories/use-categories"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

import { CategoryDialog } from "./components/category-dialog"

const PER_PAGE = 25

const FILTERS = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  ALL: "ALL",
} as const

type Filter = (typeof FILTERS)[keyof typeof FILTERS]

export function CategoriesPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>(FILTERS.ACTIVE)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [toggling, setToggling] = useState<Category | null>(null)

  const term = useDebouncedValue(query).trim().toLowerCase()

  const { canManage } = usePermissions()
  const canEdit = canManage("categories")

  const categoriesQuery = useCategories(true)
  const setActive = useSetCategoryActive()

  const categories = categoriesQuery.data ?? []
  const archivedCount = categories.filter((item) => !item.active).length
  const activeCount = categories.length - archivedCount

  const visible = categories
    .filter((category) => {
      if (filter === FILTERS.ACTIVE && !category.active) {
        return false
      }

      if (filter === FILTERS.ARCHIVED && category.active) {
        return false
      }

      if (!term) {
        return true
      }

      return (
        category.name.toLowerCase().includes(term) ||
        (category.description ?? "").toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      if (a.active !== b.active) {
        return a.active ? -1 : 1
      }

      return a.name.localeCompare(b.name, "pt-BR")
    })

  const { items, meta } = localPage(visible, page, PER_PAGE)

  const columns: DataTableColumn<Category>[] = [
    {
      id: "name",
      header: "Categoria",
      cell: (category) => (
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              "truncate text-caption font-medium",
              category.active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {category.name}
          </span>
          {category.description ? (
            <span className="truncate text-micro text-muted-foreground/70">
              {category.description}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      width: "140px",
      cell: (category) => (
        <StatusDot
          tone={category.active ? "success" : "neutral"}
          label={category.active ? "Em uso" : "Arquivada"}
        />
      ),
    },
  ]

  if (categoriesQuery.isPending) {
    return <CategoriesSkeleton />
  }

  const newCategoryAction = canEdit ? (
    <Button
      size="lg"
      onClick={() => setCreating(true)}
      className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
    >
      <Plus size={15} weight="bold" aria-hidden />
      Nova categoria
    </Button>
  ) : null

  const filtered = term.length > 0 || filter !== FILTERS.ACTIVE

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categorias"
        description="Classificam o que a empresa compra. Quem abre um pedido escolhe uma delas, e é por aqui que os relatórios agrupam o gasto."
        action={newCategoryAction}
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
              {
                id: FILTERS.ACTIVE,
                label: "Em uso",
                count: activeCount,
                tone: "success",
              },
              {
                id: FILTERS.ARCHIVED,
                label: "Arquivadas",
                count: archivedCount,
              },
              { id: FILTERS.ALL, label: "Todas", count: categories.length },
            ]}
          />

          <TableSearch
            value={query}
            onChange={(next) => {
              setQuery(next)
              setPage(1)
            }}
            placeholder="Buscar categoria"
            label="Buscar categoria"
            className="ml-auto"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="categorias"
              />
            ) : (
              <p className="text-caption text-muted-foreground">
                {archivedCount > 0
                  ? `${archivedCount} ${archivedCount === 1 ? "arquivada" : "arquivadas"} — não aparecem mais na hora de abrir um pedido.`
                  : "Todas as categorias estão disponíveis para novos pedidos."}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(category) => category.id}
            onRowClick={
              canEdit ? (category) => setEditing(category) : undefined
            }
            rowActions={
              canEdit
                ? (category) => (
                    <>
                      <RowAction
                        icon={PencilSimple}
                        label={`Editar ${category.name}`}
                        onClick={() => setEditing(category)}
                      />
                      <RowAction
                        icon={category.active ? Archive : ArrowCounterClockwise}
                        label={
                          category.active
                            ? `Arquivar ${category.name}`
                            : `Reativar ${category.name}`
                        }
                        tone={category.active ? "danger" : "neutral"}
                        onClick={() => setToggling(category)}
                      />
                    </>
                  )
                : undefined
            }
            empty={
              <EmptyState
                variant="inline"
                icon={filtered ? MagnifyingGlass : Tag}
                title={
                  filtered
                    ? "Nenhuma categoria encontrada"
                    : "Nenhuma categoria ainda"
                }
                description={
                  filtered
                    ? "Tente outro termo ou troque o filtro."
                    : "Sem categorias, quem abre um pedido não consegue classificar a compra."
                }
                action={filtered ? undefined : newCategoryAction}
              />
            }
          />
        </DataTableShell>
      </section>

      <CategoryDialog open={creating} onOpenChange={setCreating} />

      <CategoryDialog
        category={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditing(null)
          }
        }}
      />

      <ConfirmDialog
        open={toggling !== null}
        onOpenChange={(next) => {
          if (!next) {
            setToggling(null)
          }
        }}
        variant={toggling?.active ? "destructive" : "default"}
        title={
          toggling?.active
            ? `Arquivar ${toggling.name}?`
            : `Reativar ${toggling?.name ?? ""}?`
        }
        description={
          toggling?.active
            ? "Ela deixa de aparecer quando alguém abre um pedido. Os pedidos que já usam esta categoria continuam como estão."
            : "Ela volta a aparecer na hora de abrir um pedido."
        }
        confirmLabel={
          setActive.isPending
            ? "Salvando…"
            : toggling?.active
              ? "Arquivar"
              : "Reativar"
        }
        isPending={setActive.isPending}
        onConfirm={() => {
          if (!toggling) {
            return
          }

          setActive.mutate(
            { id: toggling.id, active: !toggling.active },
            {
              onSuccess: () => {
                toast.success(
                  toggling.active
                    ? `${toggling.name} foi arquivada.`
                    : `${toggling.name} voltou a ficar disponível.`,
                )
                setToggling(null)
              },
              onError: (error) => toast.error(getApiErrorMessage(error)),
            },
          )
        }}
      />
    </div>
  )
}

function CategoriesSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando categorias</span>

      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-96" />
      </div>

      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  )
}
