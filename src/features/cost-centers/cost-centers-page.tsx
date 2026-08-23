import { Plus, Stack, Warning } from "@phosphor-icons/react"
import { useState } from "react"

import { getApiErrorMessage } from "@/api/client"
import { EmptyState } from "@/components/shared/empty-state"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useCostCentersSummary } from "@/hooks/cost-centers/use-cost-centers"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { CostCenterCard } from "./components/cost-center-card"
import { CostCentersError } from "./components/cost-centers-error"
import { CostCentersSkeleton } from "./components/cost-centers-skeleton"
import { CreateCostCenterDialog } from "./components/create-cost-center-dialog"
import { FilterBar } from "./components/filter-bar"
import { readUsage } from "./usage"

type Scope = "active" | "attention" | "disabled"

const MONTH = new Intl.DateTimeFormat("pt-BR", { month: "long" })

function currentMonthLabel(): string {
  const label = MONTH.format(new Date())
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function sum(values: (string | null | undefined)[]): number {
  return values.reduce<number>((total, value) => total + Number(value ?? 0), 0)
}

export function CostCentersPage() {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<Scope>("active")

  const { canManage: canManageArea } = usePermissions()
  const canManage = canManageArea("cost-centers")

  const debouncedQuery = useDebouncedValue(query)

  const { data, isPending, isError, error, refetch } = useCostCentersSummary({
    includeDisabled: true,
    search: debouncedQuery,
  })

  if (isPending) {
    return <CostCentersSkeleton />
  }

  if (isError) {
    return (
      <CostCentersError
        message={getApiErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    )
  }

  const all = data ?? []
  const active = all.filter((node) => !node.disabledAt)
  const disabled = all.filter((node) => node.disabledAt)

  const over = active.filter((node) => readUsage(node)?.overBudget)
  const near = active.filter((node) => readUsage(node)?.nearLimit)
  const attention = [...over, ...near]

  const budgeted = active.filter((node) => node.budget)
  const totalBudget = sum(budgeted.map((n) => n.budget?.totalAmountCents))
  const totalCommitted = sum(budgeted.map((n) => n.budget?.committedCents))
  const totalUnderReview = sum(budgeted.map((n) => n.budget?.underReviewCents))
  const available = Math.max(totalBudget - totalCommitted - totalUnderReview, 0)
  const withoutBudget = active.length - budgeted.length

  const usedPercent =
    totalBudget > 0
      ? Math.round(((totalCommitted + totalUnderReview) / totalBudget) * 100)
      : 0
  const committedWidth =
    totalBudget > 0 ? Math.min((totalCommitted / totalBudget) * 100, 100) : 0
  const underReviewWidth =
    totalBudget > 0
      ? Math.min(
          (totalUnderReview / totalBudget) * 100,
          Math.max(100 - committedWidth, 0),
        )
      : 0

  const pool =
    scope === "disabled" ? disabled : scope === "attention" ? attention : active

  const term = debouncedQuery.trim()
  const visible = pool

  const roots = visible.filter((node) => !node.parentId)
  const orphans = visible.filter(
    (node) => node.parentId && !roots.some((root) => root.id === node.parentId),
  )
  const childrenOf = (parentId: string) =>
    visible.filter((node) => node.parentId === parentId)

  const createAction = canManage ? (
    <CreateCostCenterDialog
      trigger={
        <Button
          size="lg"
          className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Plus size={15} weight="bold" aria-hidden />
          Novo Centro de Custo
        </Button>
      }
    />
  ) : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Centros de Custo"
        description="Todo pedido de compra nasce dentro de um Centro de Custo. É ele que define o orçamento disponível e quem aprova."
        action={createAction}
      />

      <section
        className="rise-in grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Resumo do orçamento"
      >
        <div
          className="rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 hover:border-foreground/15 sm:col-span-2"
          title={
            totalUnderReview > 0
              ? `${formatCents(String(totalUnderReview))} aguardando decisão`
              : undefined
          }
        >
          <p className="text-caption text-muted-foreground">
            Disponível em {currentMonthLabel()}
          </p>

          <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
            <p className="text-heading text-foreground tabular-nums">
              <MoneyDisplay cents={String(available)} />
            </p>
            <span className="text-caption text-muted-foreground tabular-nums">
              de <MoneyDisplay cents={String(totalBudget)} />
            </span>
            {totalBudget > 0 ? (
              <span className="ml-auto text-caption font-medium text-brand-accent-strong tabular-nums">
                {usedPercent}% usado
              </span>
            ) : null}
          </div>

          {totalBudget > 0 ? (
            <div className="mt-2 flex h-1 overflow-hidden rounded-full bg-chart-1/15">
              <div
                className="h-full bg-chart-1 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${committedWidth}%` }}
              />
              <div
                className="h-full bg-chart-3 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${underReviewWidth}%` }}
              />
            </div>
          ) : null}
        </div>

        <Stat
          label="Centros ativos"
          value={active.length}
          hint={
            all.length === active.length ? "todos ativos" : `${all.length} no total`
          }
        />
        <Stat
          label="Sem orçamento"
          value={withoutBudget}
          hint={
            withoutBudget > 0
              ? "nenhum pedido tem saldo"
              : "todos com teto definido"
          }
          tone={withoutBudget > 0 ? "warning" : "default"}
        />
      </section>

      {over.length > 0 && scope !== "attention" ? (
        <button
          type="button"
          onClick={() => setScope("attention")}
          className="group flex items-center gap-2.5 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-left transition-colors hover:bg-destructive/8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Warning
            size={16}
            weight="fill"
            className="shrink-0 text-destructive"
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-label font-normal text-foreground">
            {over.map((node) => node.name).join(", ")}{" "}
            {over.length === 1 ? "passou" : "passaram"} do orçamento
            {near.length > 0 ? (
              <span className="text-muted-foreground">
                {" "}
                e mais {near.length} {near.length === 1 ? "está" : "estão"} perto
                do limite
              </span>
            ) : null}
          </span>
          <span className="shrink-0 text-caption text-muted-foreground underline decoration-border underline-offset-3 group-hover:decoration-muted-foreground">
            ver só estes
          </span>
        </button>
      ) : null}

      <div className="flex flex-col gap-4">
        <FilterBar<Scope>
          scope={scope}
          onScopeChange={setScope}
          query={query}
          onQueryChange={setQuery}
          placeholder="Buscar centro, código ou gestor"
          scopes={[
            { value: "active", label: "Ativos", count: active.length },
            {
              value: "attention",
              label: "Precisam de atenção",
              count: attention.length,
            },
            { value: "disabled", label: "Inativos", count: disabled.length },
          ]}
        />

        {roots.length === 0 && orphans.length === 0 ? (
          <EmptyState
            icon={Stack}
            title={emptyTitle(scope, term, canManage)}
            description={emptyDescription(scope, term, canManage)}
            action={scope === "active" && !term ? createAction : null}
          />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {roots.map((root) => (
              <li key={root.id} className="flex flex-col gap-1.5">
                <CostCenterCard node={root} />
                {childrenOf(root.id).map((child) => (
                  <CostCenterCard key={child.id} node={child} depth={1} />
                ))}
              </li>
            ))}

            {orphans.map((node) => (
              <li key={node.id}>
                <CostCenterCard node={node} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: number
  hint: string
  tone?: "default" | "warning"
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 hover:border-foreground/15">
      <p className="truncate text-caption text-muted-foreground">{label}</p>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <p className="text-heading text-foreground tabular-nums">{value}</p>
        <span
          className={cn(
            "text-caption",
            tone === "warning" && value > 0
              ? "font-medium text-warning-strong"
              : "text-muted-foreground",
          )}
        >
          {hint}
        </span>
      </div>
    </div>
  )
}

function emptyTitle(scope: Scope, term: string, canManage: boolean) {
  if (term) {
    return "Nenhum Centro de Custo encontrado"
  }

  if (scope === "attention") {
    return "Nenhum centro perto do limite"
  }

  if (scope === "disabled") {
    return "Nenhum Centro de Custo inativo"
  }

  return canManage
    ? "Comece criando seu primeiro Centro de Custo"
    : "Nenhum Centro de Custo cadastrado"
}

function emptyDescription(scope: Scope, term: string, canManage: boolean) {
  if (term) {
    return "Tente outro nome, código ou gestor."
  }

  if (scope === "attention") {
    return "Todos os centros com orçamento estão dentro do teto do período."
  }

  if (scope === "disabled") {
    return "Centros inativos bloqueiam pedidos novos, mas preservam o histórico. Nenhum foi inativado até agora."
  }

  return canManage
    ? "Sem um Centro de Custo, ninguém consegue abrir pedidos de compra. Crie um para liberar o time."
    : "Sem um Centro de Custo, ninguém consegue abrir pedidos de compra. Peça ao admin financeiro para criar o primeiro."
}
