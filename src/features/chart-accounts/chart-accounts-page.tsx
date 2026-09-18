import {
  ArrowCounterClockwise,
  Archive,
  Books,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Sparkle,
  UploadSimple,
} from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import type { ChartAccount } from "@/api/chart-accounts"
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
  StatusPill,
  TableSearch,
  TableSegments,
  TableToolbar,
  localPage,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/auth/use-permissions"
import {
  useApplyModelChart,
  useChartAccounts,
  useSetChartAccountActive,
} from "@/hooks/chart-accounts/use-chart-accounts"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { CHART_ACCOUNT_KIND_LABELS } from "@/types/enums"

import { AccountDialog } from "./components/account-dialog"
import { ImportDialog } from "./components/import-dialog"

const PER_PAGE = 30

const FILTERS = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  ALL: "ALL",
} as const

type Filter = (typeof FILTERS)[keyof typeof FILTERS]

function depthOf(code: string): number {
  return code.split(".").length
}

export function ChartAccountsPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>(FILTERS.ACTIVE)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<ChartAccount | null>(null)
  const [addingUnder, setAddingUnder] = useState<ChartAccount | undefined>()
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [toggling, setToggling] = useState<ChartAccount | null>(null)

  const term = useDebouncedValue(query).trim().toLowerCase()

  const { canManage } = usePermissions()
  const canEdit = canManage("chart-accounts")

  const accountsQuery = useChartAccounts(true)
  const setActive = useSetChartAccountActive()
  const applyModel = useApplyModelChart()

  const accounts = accountsQuery.data ?? []
  const archivedCount = accounts.filter((item) => !item.active).length
  const activeCount = accounts.length - archivedCount

  const byId = new Map(accounts.map((item) => [item.id, item]))

  const visible = accounts
    .filter((account) => {
      if (filter === FILTERS.ACTIVE && !account.active) {
        return false
      }

      if (filter === FILTERS.ARCHIVED && account.active) {
        return false
      }

      if (!term) {
        return true
      }

      return (
        account.name.toLowerCase().includes(term) ||
        account.code.toLowerCase().includes(term) ||
        (account.externalCode ?? "").toLowerCase().includes(term)
      )
    })
    .sort((a, b) =>
      a.code.localeCompare(b.code, "pt-BR", { numeric: true }),
    )

  const { items, meta } = localPage(visible, page, PER_PAGE)

  const columns: DataTableColumn<ChartAccount>[] = [
    {
      id: "code",
      header: "Código",
      width: "110px",
      cell: (account) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {account.code}
        </span>
      ),
    },
    {
      id: "name",
      header: "Conta",
      cell: (account) => (
        <span
          className="flex min-w-0 items-center gap-2"
          style={{ paddingLeft: `${(depthOf(account.code) - 1) * 14}px` }}
        >
          <span
            className={
              account.postable
                ? "truncate text-caption text-foreground"
                : "truncate text-caption font-semibold text-foreground"
            }
          >
            {account.name}
          </span>
          {!account.postable ? (
            <StatusPill tone="neutral">só organiza</StatusPill>
          ) : null}
        </span>
      ),
    },
    {
      id: "kind",
      header: "Natureza",
      width: "150px",
      hideBelow: "lg",
      cell: (account) => (
        <span className="text-caption text-muted-foreground">
          {CHART_ACCOUNT_KIND_LABELS[account.kind]}
        </span>
      ),
    },
    {
      id: "external",
      header: "ERP",
      width: "110px",
      hideBelow: "lg",
      cell: (account) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {account.externalCode ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      width: "110px",
      cell: (account) => (
        <StatusDot
          tone={account.active ? "success" : "neutral"}
          label={account.active ? "Ativa" : "Arquivada"}
        />
      ),
    },
  ]

  if (accountsQuery.isPending) {
    return <ChartAccountsSkeleton />
  }

  const newAccountAction = canEdit ? (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="lg"
        onClick={() => setImporting(true)}
        className="gap-1.5 font-medium"
      >
        <UploadSimple size={15} aria-hidden />
        Importar CSV
      </Button>
      <Button
        size="lg"
        onClick={() => {
          setAddingUnder(undefined)
          setCreating(true)
        }}
        className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
      >
        <Plus size={15} weight="bold" aria-hidden />
        Nova conta
      </Button>
    </div>
  ) : null

  const filtered = term.length > 0 || filter !== FILTERS.ACTIVE
  const empty = accounts.length === 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plano de contas"
        description="A base contábil que o rateio dos pedidos usa para classificar cada compra. Quem pede escolhe o centro de custo, e o plano define em qual conta o gasto entra."
        action={newAccountAction}
      />

      {empty ? (
        <EmptyState
          icon={Books}
          tone="primary"
          title="Ainda sem plano de contas"
          description="Aplique um plano modelo enxuto para começar hoje, ou importe a planilha que o seu contador já usa."
          action={
            canEdit ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setImporting(true)}
                  className="gap-1.5 font-medium"
                >
                  <UploadSimple size={15} aria-hidden />
                  Importar planilha
                </Button>
                <Button
                  disabled={applyModel.isPending}
                  onClick={() =>
                    applyModel.mutate(undefined, {
                      onSuccess: (data) =>
                        toast.success(
                          `Plano modelo aplicado: ${data.created} contas, ${data.categoriesLinked} categorias já ligadas.`,
                        ),
                      onError: (error) =>
                        toast.error(getApiErrorMessage(error)),
                    })
                  }
                  className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
                >
                  <Sparkle size={15} weight="fill" aria-hidden />
                  {applyModel.isPending ? "Aplicando…" : "Usar plano modelo"}
                </Button>
              </div>
            ) : undefined
          }
        />
      ) : (
        <section className="flex flex-col gap-3">
          <p className="text-caption leading-relaxed text-muted-foreground">
            Contas com o selo <StatusPill tone="neutral">só organiza</StatusPill>{" "}
            são pastas: elas agrupam as de baixo, mas nunca recebem rateio
            direto. As demais são as que aparecem para escolher num pedido.
          </p>

          <TableToolbar>
            <TableSegments
              value={filter}
              onChange={(next) => {
                setFilter(next)
                setPage(1)
              }}
              segments={[
                { id: FILTERS.ACTIVE, label: "Ativas", count: activeCount, tone: "success" },
                { id: FILTERS.ARCHIVED, label: "Arquivadas", count: archivedCount },
                { id: FILTERS.ALL, label: "Todas", count: accounts.length },
              ]}
            />

            <TableSearch
              value={query}
              onChange={(next) => {
                setQuery(next)
                setPage(1)
              }}
              placeholder="Buscar por código ou nome"
              label="Buscar conta contábil"
              className="ml-auto"
            />
          </TableToolbar>

          <DataTableShell
            footer={
              meta.totalPages > 1 ? (
                <DataTablePagination
                  meta={meta}
                  onPageChange={setPage}
                  label="contas"
                />
              ) : (
                <p className="text-caption text-muted-foreground">
                  {accounts.filter((item) => item.postable && item.active).length}{" "}
                  contas analíticas ativas recebem rateio.
                </p>
              )
            }
          >
            <DataTable
              columns={columns}
              rows={items}
              rowKey={(account) => account.id}
              onRowClick={canEdit ? (account) => setEditing(account) : undefined}
              rowActions={
                canEdit
                  ? (account) => (
                      <>
                        {!account.postable ? (
                          <RowAction
                            icon={Plus}
                            label={`Adicionar conta abaixo de ${account.name}`}
                            onClick={() => {
                              setAddingUnder(account)
                              setCreating(true)
                            }}
                          />
                        ) : null}
                        <RowAction
                          icon={PencilSimple}
                          label={`Editar ${account.name}`}
                          onClick={() => setEditing(account)}
                        />
                        <RowAction
                          icon={account.active ? Archive : ArrowCounterClockwise}
                          label={
                            account.active
                              ? `Arquivar ${account.name}`
                              : `Reativar ${account.name}`
                          }
                          tone={account.active ? "danger" : "neutral"}
                          onClick={() => setToggling(account)}
                        />
                      </>
                    )
                  : undefined
              }
              empty={
                <EmptyState
                  variant="inline"
                  icon={filtered ? MagnifyingGlass : Books}
                  title={
                    filtered
                      ? "Nenhuma conta encontrada"
                      : "Nenhuma conta ainda"
                  }
                  description={
                    filtered
                      ? "Tente outro termo ou troque o filtro."
                      : "Crie a primeira conta contábil do plano."
                  }
                />
              }
            />
          </DataTableShell>
        </section>
      )}

      <AccountDialog
        parent={addingUnder}
        open={creating}
        onOpenChange={setCreating}
      />

      <AccountDialog
        account={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditing(null)
          }
        }}
      />

      <ImportDialog open={importing} onOpenChange={setImporting} />

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
            ? (toggling.parentId && byId.get(toggling.parentId)?.active === false
                ? "A conta superior está arquivada. Reative-a antes, ou o rateio pode ficar sem essa opção."
                : "Ela deixa de aparecer no rateio de novos pedidos. Lançamentos antigos continuam apontando para ela.")
            : "Ela volta a aparecer como opção no rateio dos pedidos."
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

function ChartAccountsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <span className="sr-only">Carregando plano de contas</span>

      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-96" />
      </div>

      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}
