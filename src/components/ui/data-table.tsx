import {
  ArrowDown,
  ArrowUp,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  type Icon,
} from "@phosphor-icons/react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger"

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

const DOT_CLASS: Record<Tone, string> = {
  neutral: "bg-muted-foreground/40",
  brand: "bg-primary",
  success: "bg-brand-accent",
  warning: "bg-warning",
  danger: "bg-destructive",
}

const TONE_TEXT_CLASS: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  brand: "text-primary",
  success: "text-brand-accent-strong",
  warning: "text-warning-strong",
  danger: "text-destructive",
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
  rowActions,
  rowAccent,
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
  rowActions?: (row: T) => React.ReactNode
  rowAccent?: (row: T) => Tone | undefined
}) {
  if (!isLoading && rows.length === 0 && empty) {
    return <div className="px-3 py-10">{empty}</div>
  }

  const selectable = selection !== undefined && onSelectionChange !== undefined
  const allIds = rows.map(rowKey)
  const allSelected =
    selectable &&
    allIds.length > 0 &&
    allIds.every((id) => selection.includes(id))
  const someSelected =
    selectable && !allSelected && allIds.some((id) => selection.includes(id))

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

  const cards = (
    <ul className="flex flex-col divide-y divide-border/40 sm:hidden">
      {rows.map((row) => {
        const id = rowKey(row)
        const accent = rowAccent?.(row)
        const [first, ...rest] = columns

        return (
          <li key={id}>
            <button
              type="button"
              disabled={!onRowClick}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "relative flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors",
                onRowClick && "hover:bg-muted/40",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:-outline-offset-2",
              )}
            >
              {accent ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 left-0 w-0.5",
                    accent === "danger" ? "bg-destructive" : "bg-warning",
                  )}
                />
              ) : null}

              <div className="min-w-0 text-label text-foreground">
                {first ? first.cell(row) : null}
              </div>

              <dl className="flex flex-col gap-1.5">
                {rest.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <dt className="shrink-0 text-caption text-muted-foreground">
                      {column.header}
                    </dt>
                    <dd className="min-w-0 text-caption text-foreground">
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </button>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      {cards}

      <div className="hidden w-full overflow-x-auto sm:block">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border bg-card/95 backdrop-blur-sm">
            {selectable ? (
              <th scope="col" className="w-10 pl-5">
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
                    active ? "text-foreground" : "text-muted-foreground/70",
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

            {rowActions ? <th scope="col" className="w-16 pr-4" /> : null}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-border/40 last:border-0"
                >
                  {selectable ? <td className="pl-4" /> : null}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        "h-14 px-3.5 first:pl-5 last:pr-5",
                        column.hideBelow && HIDE_CLASS[column.hideBelow],
                      )}
                    >
                      <Skeleton className="h-3.5 w-full max-w-28" />
                    </td>
                  ))}
                  {rowActions ? <td className="pr-4" /> : null}
                </tr>
              ))
            : rows.map((row) => {
                const id = rowKey(row)
                const checked = selectable && selection.includes(id)
                const accent = rowAccent?.(row)
                const marked = accent === "warning" || accent === "danger"

                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "group/row relative border-b border-border/40 transition-colors duration-150 last:border-0",
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

                    {columns.map((column, columnIndex) => (
                      <td
                        key={column.id}
                        className={cn(
                          "relative h-14 px-3.5 align-middle text-label font-normal text-foreground first:pl-5 last:pr-5",
                          column.align === "end" && "text-right",
                          column.hideBelow && HIDE_CLASS[column.hideBelow],
                        )}
                      >
                        {marked && columnIndex === 0 && !selectable ? (
                          <span
                            aria-hidden
                            className={cn(
                              "absolute inset-y-0 left-0 w-0.5",
                              accent === "danger"
                                ? "bg-destructive"
                                : "bg-warning",
                            )}
                          />
                        ) : null}
                        {column.cell(row)}
                      </td>
                    ))}

                    {rowActions ? (
                      <td
                        className="pr-4 align-middle"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100">
                          {rowActions(row)}
                        </span>
                      </td>
                    ) : null}
                  </tr>
                )
              })}
        </tbody>
      </table>
      </div>
    </>
  )
}

export function StatusDot({
  tone,
  label,
  align = "start",
}: {
  tone: Tone
  label: string
  align?: "start" | "end"
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1.5",
        align === "end" ? "justify-end" : "justify-start",
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[tone])}
      />
      <span className={cn("truncate text-caption", TONE_TEXT_CLASS[tone])}>
        {label}
      </span>
    </span>
  )
}

export function RowAction({
  icon: ActionIcon,
  label,
  onClick,
  tone = "neutral",
}: {
  icon: Icon
  label: string
  onClick: () => void
  tone?: "neutral" | "danger"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        tone === "danger"
          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <ActionIcon size={15} aria-hidden />
    </button>
  )
}

export function TableSearch({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/") {
        return
      }

      const target = event.target as HTMLElement | null
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      if (typing) {
        return
      }

      event.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className={cn("relative min-w-0 sm:w-72", className)}>
      <MagnifyingGlass
        size={14}
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />

      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault()
            onChange("")
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "h-8 w-full rounded-md border border-border bg-card pr-9 pl-8 text-caption text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm px-1 text-micro text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          limpar
        </button>
      ) : (
        <kbd
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border px-1 py-px font-sans text-micro leading-none text-muted-foreground/70"
        >
          /
        </kbd>
      )}
    </div>
  )
}

export function TableSegments<T extends string>({
  value,
  onChange,
  segments,
  className,
}: {
  value: T
  onChange: (value: T) => void
  segments: { id: T; label: string; count?: number; tone?: Tone }[]
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar listagem"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5",
        className,
      )}
    >
      {segments.map((segment) => {
        const active = value === segment.id
        const empty = segment.count === 0 && !active

        return (
          <button
            key={segment.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(segment.id)}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-caption whitespace-nowrap transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active
                ? "bg-card text-foreground shadow-xs"
                : empty
                  ? "text-muted-foreground/50 hover:text-muted-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {segment.tone && segment.tone !== "neutral" ? (
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  DOT_CLASS[segment.tone],
                  empty && "opacity-40",
                )}
              />
            ) : null}

            {segment.label}

            {segment.count !== undefined ? (
              <span
                className={cn(
                  "tabular text-micro",
                  active ? "text-muted-foreground" : "text-muted-foreground/60",
                )}
              >
                {segment.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function TableToolbar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 pb-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function StatusPill({
  tone = "neutral",
  dot = false,
  children,
  className,
}: {
  tone?: Tone
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
