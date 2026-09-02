import { Buildings, MagnifyingGlass } from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import type { Organization } from "@/api/platform"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
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
import { useOrganizations } from "@/hooks/platform/use-platform"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatCnpj } from "@/lib/cnpj"
import { cn } from "@/lib/utils"
import {
  PLAN_TIER_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  SubscriptionStatus,
} from "@/types/enums"

const PER_PAGE = 25

function statusTone(status: SubscriptionStatus | null) {
  if (status === SubscriptionStatus.ACTIVE) {
    return "success" as const
  }

  if (status === SubscriptionStatus.TRIALING) {
    return "brand" as const
  }

  return "warning" as const
}

export function OrganizationsPage() {
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const search = useDebouncedValue(query).trim()

  const listQuery = useMemo(
    () => ({ page, perPage: PER_PAGE, ...(search ? { search } : {}) }),
    [page, search],
  )

  const organizations = useOrganizations(listQuery)

  const columns: DataTableColumn<Organization>[] = [
    {
      id: "company",
      header: "Organização",
      cell: (item) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption font-medium text-foreground">
            {item.tradeName ?? item.legalName}
          </span>
          <span className="truncate text-micro tabular-nums text-muted-foreground/70">
            {formatCnpj(item.cnpj)}
          </span>
        </span>
      ),
    },
    {
      id: "plan",
      header: "Plano",
      width: "170px",
      cell: (item) =>
        item.plan ? (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-caption text-foreground">
              {item.plan.name}
            </span>
            <span className="truncate text-micro text-muted-foreground/70">
              {PLAN_TIER_LABELS[item.plan.tier] ?? item.plan.tier}
            </span>
          </span>
        ) : (
          <StatusPill tone="neutral">Sem plano</StatusPill>
        ),
    },
    {
      id: "status",
      header: "Assinatura",
      width: "130px",
      cell: (item) =>
        item.subscriptionStatus ? (
          <StatusPill tone={statusTone(item.subscriptionStatus)}>
            {SUBSCRIPTION_STATUS_LABELS[item.subscriptionStatus]}
          </StatusPill>
        ) : (
          <span className="text-caption text-muted-foreground/60">—</span>
        ),
    },
    {
      id: "seats",
      header: "Vagas",
      align: "end",
      hideBelow: "lg",
      width: "110px",
      cell: (item) => {
        const limit = item.plan?.maxMembers ?? null
        const full = limit !== null && item.usedSeats >= limit

        return (
          <span
            className={cn(
              "text-caption tabular-nums",
              full ? "font-medium text-warning-strong" : "text-muted-foreground",
            )}
          >
            {item.usedSeats}
            {limit === null ? "" : ` / ${limit}`}
          </span>
        )
      },
    },
    {
      id: "price",
      header: "Mensalidade",
      align: "end",
      hideBelow: "xl",
      width: "130px",
      cell: (item) =>
        item.plan ? (
          <MoneyDisplay cents={item.plan.priceCents} />
        ) : (
          <span className="text-caption text-muted-foreground/60">—</span>
        ),
    },
  ]

  if (organizations.isPending && !organizations.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (organizations.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Organizações" />
        <LoadError onRetry={() => void organizations.refetch()} />
      </div>
    )
  }

  const rows = organizations.data?.items ?? []
  const meta = organizations.data?.meta

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Organizações"
        description="Todas as empresas que usam o AprovAI, com o plano contratado e quantas vagas já ocupam."
      />

      <section>
        <TableToolbar>
          <TableSearch
            value={query}
            onChange={(next) => {
              setQuery(next)
              setPage(1)
            }}
            placeholder="Buscar por nome ou CNPJ"
            label="Buscar organização"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="organizações"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0}{" "}
                {meta?.total === 1 ? "organização" : "organizações"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(item) => item.companyId}
            onRowClick={(item) =>
              navigate(`/plataforma/organizacoes/${item.companyId}`)
            }
            rowAccent={(item) => (item.disabledAt ? "danger" : undefined)}
            empty={
              <EmptyState
                variant="inline"
                icon={search ? MagnifyingGlass : Buildings}
                title={
                  search
                    ? "Nenhuma organização encontrada"
                    : "Nenhuma organização ainda"
                }
                description={
                  search
                    ? "Tente outro nome ou CNPJ."
                    : "Assim que uma empresa concluir o cadastro, ela aparece aqui."
                }
              />
            }
          />
        </DataTableShell>
      </section>
    </div>
  )
}
