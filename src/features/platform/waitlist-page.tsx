import { Envelope, MagnifyingGlass } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import type { WaitlistEntry } from "@/api/marketing"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  StatusPill,
  TableSearch,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useWaitlist } from "@/hooks/marketing/use-marketing"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

function when(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  })
}

export function WaitlistPage() {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const search = useDebouncedValue(query, 300)

  const params = useMemo(
    () => ({ page, perPage: 20, search: search || undefined }),
    [page, search],
  )

  const waitlist = useWaitlist(params)

  const columns: DataTableColumn<WaitlistEntry>[] = [
    {
      id: "email",
      header: "Contato",
      cell: (item) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption text-foreground">
            {item.email}
          </span>
          {item.name ? (
            <span className="truncate text-micro text-muted-foreground/70">
              {item.name}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      id: "company",
      header: "Empresa",
      width: "200px",
      cell: (item) => (
        <span className="truncate text-caption text-muted-foreground">
          {item.company ?? "—"}
        </span>
      ),
    },
    {
      id: "source",
      header: "Origem",
      width: "140px",
      hideBelow: "lg",
      cell: (item) =>
        item.source ? (
          <StatusPill tone="neutral">{item.source}</StatusPill>
        ) : (
          <span className="text-caption text-muted-foreground/60">—</span>
        ),
    },
    {
      id: "createdAt",
      header: "Entrou em",
      width: "110px",
      align: "end",
      cell: (item) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {when(item.createdAt)}
        </span>
      ),
    },
  ]

  if (waitlist.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Lista de espera" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (waitlist.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Lista de espera" />
        <LoadError onRetry={() => void waitlist.refetch()} />
      </div>
    )
  }

  const rows = waitlist.data?.items ?? []
  const meta = waitlist.data?.meta

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Lista de espera"
        description="Quem deixou o e-mail no site, na ordem em que entrou."
      />

      <section>
        <TableToolbar>
          <TableSearch
            value={query}
            onChange={(next) => {
              setQuery(next)
              setPage(1)
            }}
            placeholder="Buscar por e-mail ou empresa"
            label="Buscar na lista de espera"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="inscritos"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0}{" "}
                {meta?.total === 1 ? "inscrito" : "inscritos"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(item) => item.id}
            empty={
              <EmptyState
                variant="inline"
                icon={search ? MagnifyingGlass : Envelope}
                title={
                  search ? "Ninguém encontrado" : "Ninguém na lista ainda"
                }
                description={
                  search
                    ? "Tente outro e-mail ou empresa."
                    : "Assim que alguém deixar o e-mail no site, aparece aqui."
                }
              />
            }
          />
        </DataTableShell>
      </section>
    </div>
  )
}
