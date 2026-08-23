import {
  ArrowDown,
  ArrowUp,
  CaretLeft,
  CaretRight,
  type Icon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  id: string
  header: React.ReactNode
  icon?: Icon
  cell: (row: T) => React.ReactNode
  align?: "start" | "end"
  width?: string
  hideBelow?: "sm" | "lg" | "xl"
  sortable?: boolean
}

const HIDE_CLASS = {
  sm: "hidden sm:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
}

export function DataTableShell({
  title,
  count,
  toolbar,
  footer,
  children,
  className,
}: {
  title?: React.ReactNode
  count?: number
  toolbar?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs",
        className,
      )}
    >
      {title || toolbar ? (
        <header className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4">
          {title ? (
            <h2 className="flex items-center gap-1.5 text-overline text-muted-foreground">
              {title}
              {count !== undefined ? (
                <span className="tabular-nums text-muted-foreground/60">
                  {count}
                </span>
              ) : null}
            </h2>
          ) : null}
          {toolbar ? (
            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                title ? "ml-auto" : "w-full",
              )}
            >
              {toolbar}
            </div>
          ) : null}
        </header>
      ) : null}

      {children}

      {footer ? (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-2.5">
          {footer}
        </footer>
      ) : null}
    </section>
  )
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isLoading = false,
  skeletonRows = 5,
  empty,
  sort,
  onSortChange,
  selection,
  onSelectionChange,
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  isLoading?: boolean
  skeletonRows?: number
  empty?: React.ReactNode
  sort?: { id: string; direction: "asc" | "desc" } | null
  onSortChange?: (id: string) => void
  selection?: string[]
  onSelectionChange?: (ids: string[]) => void
}) {
  if (!isLoading && rows.length === 0 && empty) {
    return <div className="px-3 py-10">{empty}</div>
  }

  const selectable = selection !== undefined && onSelectionChange !== undefined
  const allIds = rows.map(rowKey)
  const allSelected = selectable && allIds.length > 0 && allIds.every((id) => selection.includes(id))
  const someSelected = selectable && !allSelected && allIds.some((id) => selection.includes(id))

  function toggleAll() {
    if (!selectable) {
      return
    }

    onSelectionChange(allSelected ? [] : allIds)
  }

  function toggleOne(id: string) {
    if (!selectable) {
      return
    }

    onSelectionChange(
      selection.includes(id)
        ? selection.filter((item) => item !== id)
        : [...selection, id],
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border bg-card">
            {selectable ? (
              <th scope="col" className="w-9 pl-4">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                />
              </th>
            ) : null}

            {columns.map((column) => {
              const active = sort?.id === column.id
              const sortable = column.sortable && onSortChange
              const ColumnIcon = column.icon

              const label = (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap text-overline",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {ColumnIcon ? (
                    <ColumnIcon
                      size={11}
                      className="shrink-0 text-muted-foreground/60"
                      aria-hidden
                    />
                  ) : null}
                  {column.header}
                  {active ? (
                    sort.direction === "asc" ? (
                      <ArrowUp size={10} weight="bold" aria-hidden />
                    ) : (
                      <ArrowDown size={10} weight="bold" aria-hidden />
                    )
                  ) : null}
                </span>
              )

              return (
                <th
                  key={column.id}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={cn(
                    "h-8 px-3 align-middle first:pl-4 last:pr-4",
                    column.align === "end" && "text-right",
                    column.hideBelow && HIDE_CLASS[column.hideBelow],
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.id)}
                      className={cn(
                        "inline-flex max-w-full items-center rounded-sm transition-colors hover:text-foreground",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        column.align === "end" && "flex-row-reverse",
                      )}
                    >
                      {label}
                    </button>
                  ) : (
                    label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 last:border-0"
                >
                  {selectable ? <td className="pl-4" /> : null}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        "px-3 py-2.5",
                        column.hideBelow && HIDE_CLASS[column.hideBelow],
                      )}
                    >
                      <Skeleton className="h-4 w-full max-w-28" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => {
                const id = rowKey(row)
                const checked = selectable && selection.includes(id)

                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "group/row border-b border-border/40 transition-colors last:border-0",
                      checked
                        ? "border-l-2 border-l-primary bg-primary/4"
                        : "hover:bg-muted/40",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {selectable ? (
                      <td
                        className="pl-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleOne(id)}
                          aria-label="Selecionar linha"
                        />
                      </td>
                    ) : null}

                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "h-12 px-3 align-middle text-caption text-foreground first:pl-4 last:pr-4",
                          column.align === "end" && "text-right",
                          column.hideBelow && HIDE_CLASS[column.hideBelow],
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
        </tbody>
      </table>
    </div>
  )
}

export function StatusPill({
  tone = "neutral",
  dot = false,
  children,
  className,
}: {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger"
  dot?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-px text-micro whitespace-nowrap",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "brand" && "bg-primary/8 text-primary",
        tone === "success" && "bg-brand-accent/10 text-brand-accent-strong",
        tone === "warning" && "bg-warning/12 text-warning-strong",
        tone === "danger" && "bg-destructive/10 text-destructive",
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            tone === "neutral" && "bg-muted-foreground/60",
            tone === "brand" && "bg-primary",
            tone === "success" && "bg-brand-accent",
            tone === "warning" && "bg-warning",
            tone === "danger" && "bg-destructive",
          )}
        />
      ) : null}
      {children}
    </span>
  )
}

export function CellPerson({
  initials,
  name,
  detail,
  tone = "neutral",
  badge,
}: {
  initials: string
  name: string
  detail?: string
  tone?: "neutral" | "brand"
  badge?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className={cn(
          "flex size-6.5 shrink-0 items-center justify-center rounded-full text-overline normal-case tracking-normal",
          tone === "brand"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        {initials}
      </span>

      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-caption font-medium text-foreground">
          {name}
        </span>
        {detail ? (
          <span className="hidden truncate text-caption text-muted-foreground/80 lg:inline">
            {detail}
          </span>
        ) : null}
        {badge}
      </div>
    </div>
  )
}

export interface PageMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export function localPage<T>(
  rows: T[],
  page: number,
  perPage: number,
): { items: T[]; meta: PageMeta } {
  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * perPage

  return {
    items: rows.slice(start, start + perPage),
    meta: { total, page: safePage, perPage, totalPages },
  }
}

export function DataTablePagination({
  meta,
  onPageChange,
  label = "itens",
}: {
  meta: PageMeta
  onPageChange: (page: number) => void
  label?: string
}) {
  const first = meta.total === 0 ? 0 : (meta.page - 1) * meta.perPage + 1
  const last = Math.min(meta.page * meta.perPage, meta.total)

  return (
    <>
      <p className="text-caption tabular-nums text-muted-foreground">
        {first}–{last} de {meta.total} {label}
      </p>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Página anterior"
          className="h-7 gap-1 px-2"
        >
          <CaretLeft size={12} weight="bold" aria-hidden />
          Anterior
        </Button>

        <span className="px-2 text-caption tabular-nums text-muted-foreground">
          {meta.page} / {meta.totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Próxima página"
          className="h-7 gap-1 px-2"
        >
          Próxima
          <CaretRight size={12} weight="bold" aria-hidden />
        </Button>
      </div>
    </>
  )
}
