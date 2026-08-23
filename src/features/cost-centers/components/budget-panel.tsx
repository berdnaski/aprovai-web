import {
  ArrowRight,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Receipt,
  Wallet,
} from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import type { Budget } from "@/api/budgets"
import { getApiErrorMessage } from "@/api/client"
import type { CostCenterSummary } from "@/api/cost-centers"
import { EmptyState } from "@/components/shared/empty-state"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useBudgetEntries,
  useCostCenterBudgets,
} from "@/hooks/budgets/use-budgets"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

import { AdjustBudgetDialog } from "./adjust-budget-dialog"
import { CostCentersError } from "./cost-centers-error"
import { CreateBudgetDialog } from "./create-budget-dialog"
import { PeriodToolbar } from "./period-toolbar"
import { EntryRow } from "./entry-row"
import { formatPeriodLabel, isCurrentPeriod } from "../period"
import { BUDGET_ENTRY_TYPE_LABELS, BudgetEntryType } from "@/types/enums"

const ALL_ENTRIES = "ALL" as const

type EntryFilter = typeof ALL_ENTRIES | BudgetEntryType

const ENTRY_FILTERS: { value: EntryFilter; label: string }[] = [
  { value: ALL_ENTRIES, label: "Todos" },
  {
    value: BudgetEntryType.CONSUMPTION,
    label: BUDGET_ENTRY_TYPE_LABELS.CONSUMPTION,
  },
  {
    value: BudgetEntryType.REVERSAL,
    label: BUDGET_ENTRY_TYPE_LABELS.REVERSAL,
  },
]

export function BudgetPanel({
  costCenterId,
  node,
}: {
  costCenterId: string
  node: CostCenterSummary
}) {
  const [periodId, setPeriodId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<EntryFilter>(ALL_ENTRIES)

  const { canManage: canManageArea } = usePermissions()
  const canManage = canManageArea("cost-centers")

  const budgetsQuery = useCostCenterBudgets(costCenterId)
  const budgets = useMemo(
    () =>
      [...(budgetsQuery.data ?? [])].sort((a, b) =>
        b.periodStart.localeCompare(a.periodStart),
      ),
    [budgetsQuery.data],
  )

  const current = budgets.find((budget) => isCurrentPeriod(budget)) ?? budgets[0]
  const selected = budgets.find((budget) => budget.id === periodId) ?? current

  const debouncedQuery = useDebouncedValue(query)

  const entriesQuery = useBudgetEntries(selected?.id, {
    type: filter === ALL_ENTRIES ? undefined : filter,
    search: debouncedQuery,
  })

  const allEntriesQuery = useBudgetEntries(selected?.id)

  if (budgetsQuery.isPending) {
    return <BudgetPanelSkeleton />
  }

  if (budgetsQuery.isError) {
    return (
      <CostCentersError
        title="Não foi possível carregar o orçamento"
        message={getApiErrorMessage(budgetsQuery.error)}
        onRetry={() => void budgetsQuery.refetch()}
      />
    )
  }

  if (!selected) {
    return (
      <NoBudgetState costCenterId={costCenterId} canManage={canManage} />
    )
  }

  const allEntries = allEntriesQuery.data ?? []
  const visible = entriesQuery.data ?? []
  const past = budgets.filter((budget) => budget.id !== current?.id)

  const total = BigInt(selected.totalAmountCents)
  const committed = allEntries.reduce(
    (sum, entry) => sum + BigInt(entry.amountCents),
    0n,
  )
  const underReview =
    selected.id === current?.id
      ? BigInt(node.budget?.underReviewCents ?? 0)
      : 0n

  const used = committed + underReview
  const available = total > used ? total - used : 0n
  const exceeded = used > total ? used - total : 0n
  const overBudget = used > total

  const totalRatio = Number(total)
  const percent =
    totalRatio > 0 ? Math.round((Number(used) / totalRatio) * 100) : 0

  const committedWidth =
    totalRatio > 0 ? Math.min((Number(committed) / totalRatio) * 100, 100) : 0
  const underReviewWidth =
    totalRatio > 0
      ? Math.min(
          (Number(underReview) / totalRatio) * 100,
          Math.max(100 - committedWidth, 0),
        )
      : 0

  const countByType: Record<EntryFilter, number> = {
    [ALL_ENTRIES]: allEntries.length,
    [BudgetEntryType.CONSUMPTION]: allEntries.filter(
      (entry) => entry.type === BudgetEntryType.CONSUMPTION,
    ).length,
    [BudgetEntryType.REVERSAL]: allEntries.filter(
      (entry) => entry.type === BudgetEntryType.REVERSAL,
    ).length,
  }

  const label = formatPeriodLabel(selected)
  const isCurrent = selected.id === current?.id

  return (
    <div className="flex flex-col gap-4">
      <PeriodToolbar
        budgets={budgets}
        value={selected.id}
        onChange={setPeriodId}
        costCenterId={costCenterId}
      />

      <section
        aria-label={`Orçamento de ${label}`}
        className="rise-in overflow-hidden rounded-lg border border-border bg-card"
      >
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-heading text-foreground">{label}</h3>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-caption font-medium",
                isCurrent
                  ? "border-primary/20 bg-primary/[0.07] text-primary"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {isCurrent ? "em curso" : "encerrado"}
            </span>
          </div>

          {canManage ? (
            <AdjustBudgetDialog
              budget={selected}
              committedCents={String(committed)}
              underReviewCents={String(underReview)}
              trigger={
                <Button variant="outline" className="h-8 gap-1.5 font-medium">
                  <PencilSimple size={14} aria-hidden />
                  Ajustar teto
                </Button>
              }
            />
          ) : null}
        </header>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <p className="text-caption text-muted-foreground">
                {overBudget ? "Acima do teto" : "Disponível para novos pedidos"}
              </p>
              <p
                className={cn(
                  "mt-1 text-display tabular-nums",
                  overBudget ? "text-destructive" : "text-foreground",
                )}
              >
                <MoneyDisplay
                  cents={overBudget ? String(exceeded) : String(available)}
                />
              </p>
            </div>

            <p className="text-caption text-muted-foreground tabular-nums">
              <span
                className={cn(
                  "text-body font-medium",
                  overBudget ? "text-destructive" : "text-foreground",
                )}
              >
                {percent}%
              </span>{" "}
              de <MoneyDisplay cents={selected.totalAmountCents} />
            </p>
          </div>

          <div
            className={cn(
              "mt-4 flex h-2 overflow-hidden rounded-full",
              overBudget ? "bg-chart-4/15" : "bg-chart-1/15",
            )}
            role="img"
            aria-label={`${percent}% do orçamento usado`}
          >
            <div
              className={cn(
                "h-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
                overBudget ? "bg-chart-4" : "bg-chart-1",
              )}
              style={{ width: `${committedWidth}%` }}
            />
            <div
              className={cn(
                "h-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
                overBudget ? "bg-destructive/40" : "bg-chart-3",
              )}
              style={{ width: `${underReviewWidth}%` }}
            />
          </div>

          <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <Figure
              label="Orçado"
              hint="teto do período"
              value={selected.totalAmountCents}
            />
            <Figure
              label="Comprometido"
              hint="já deduzido do saldo"
              value={String(committed)}
              swatch={overBudget ? "bg-chart-4" : "bg-chart-1"}
            />
            <Figure
              label="Aguardando decisão"
              hint="ainda não deduz saldo"
              value={String(underReview)}
              swatch={overBudget ? "bg-destructive/40" : "bg-chart-3"}
            />
            <Figure
              label={overBudget ? "Excedido" : "Disponível"}
              hint={overBudget ? "acima do teto" : "livre para gastar"}
              value={overBudget ? String(exceeded) : String(available)}
              tone={overBudget ? "destructive" : "success"}
            />
          </dl>
        </div>
      </section>

      <section
        aria-label={`Extrato de ${label}`}
        className="rise-in overflow-hidden rounded-lg border border-border bg-card [animation-delay:80ms]"
      >
        <header className="flex flex-col gap-4 border-b border-border px-5 pt-4 pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-label text-foreground">Extrato de {label}</h3>
            <p className="text-caption text-muted-foreground">
              cada linha é um pedido que consumiu ou devolveu saldo
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-2">
            <div
              role="tablist"
              aria-label="Filtrar lançamentos"
              className="flex items-center gap-4"
            >
              {ENTRY_FILTERS.map((item) => (
                <FilterTab
                  key={item.value}
                  active={filter === item.value}
                  onClick={() => setFilter(item.value)}
                  count={countByType[item.value]}
                >
                  {item.label}
                </FilterTab>
              ))}
            </div>

            <div className="relative mb-1 min-w-0 flex-1 sm:max-w-56">
              <MagnifyingGlass
                size={14}
                className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar lançamento"
                aria-label="Buscar no extrato"
                className="pl-8"
              />
            </div>
          </div>
        </header>

        {entriesQuery.isPending ? (
          <div className="flex flex-col gap-3 px-5 py-4">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : visible.length > 0 ? (
          <ul className="divide-y divide-border/60">
            {visible.map((entry) => (
              <li key={entry.id}>
                <EntryRow
                  description={entry.description}
                  type={entry.type}
                  amountCents={entry.amountCents}
                  occurredAt={entry.occurredAt}
                />
              </li>
            ))}
          </ul>
        ) : allEntries.length === 0 ? (
          <EmptyState
            variant="inline"
            icon={Receipt}
            title="Nenhum movimento ainda"
            description="Quando um pedido for aprovado, ele aparece aqui consumindo o orçamento do período."
          />
        ) : (
          <EmptyState
            variant="inline"
            icon={MagnifyingGlass}
            title="Nenhum lançamento encontrado"
            description="Tente outro termo ou volte para o filtro Todos."
          />
        )}

        {visible.length > 0 ? (
          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border bg-muted/30 px-5 py-3">
            <p className="text-caption text-muted-foreground">
              {visible.length} de {allEntries.length}{" "}
              {allEntries.length === 1 ? "lançamento" : "lançamentos"}
            </p>
            <p className="text-caption text-muted-foreground">
              consumo líquido no período{" "}
              <span className="text-body font-medium text-foreground tabular-nums">
                <MoneyDisplay cents={String(committed)} />
              </span>
            </p>
          </footer>
        ) : null}
      </section>

      {past.length > 0 ? (
        <section
          aria-label="Períodos anteriores"
          className="rise-in overflow-hidden rounded-lg border border-border bg-card [animation-delay:140ms]"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-3">
            <h3 className="text-label text-foreground">Períodos anteriores</h3>
            <p className="text-caption text-muted-foreground">
              o saldo nunca passa de um mês para o outro
            </p>
          </header>

          <ul className="divide-y divide-border/60">
            {past.map((budget) => (
              <li key={budget.id}>
                <PastPeriodRow
                  budget={budget}
                  onSelect={() => setPeriodId(budget.id)}
                  active={budget.id === selected.id}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function Figure({
  label,
  hint,
  value,
  swatch,
  tone = "default",
}: {
  label: string
  hint: string
  value: string
  swatch?: string
  tone?: "default" | "destructive" | "success"
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-caption text-muted-foreground">
        {swatch ? (
          <span
            aria-hidden
            className={cn("size-2.5 shrink-0 rounded-[3px]", swatch)}
          />
        ) : null}
        <span className="truncate">{label}</span>
      </dt>
      <dd
        className={cn(
          "mt-1 text-body font-medium tabular-nums",
          tone === "destructive"
            ? "text-destructive"
            : tone === "success"
              ? "text-brand-accent-strong"
              : "text-foreground",
        )}
      >
        <MoneyDisplay cents={value} />
      </dd>
      <p className="mt-0.5 text-caption text-muted-foreground/70">{hint}</p>
    </div>
  )
}

function FilterTab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 border-b-2 pb-1 text-label whitespace-nowrap transition-colors duration-150",
        "focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "border-foreground font-medium text-foreground"
          : "border-transparent font-normal text-muted-foreground hover:border-border hover:text-foreground",
      )}
    >
      {children}
      <span
        className={cn(
          "rounded px-1 text-caption tabular-nums transition-colors",
          active ? "bg-muted text-muted-foreground" : "text-muted-foreground/60",
        )}
      >
        {count}
      </span>
    </button>
  )
}

function PastPeriodRow({
  budget,
  onSelect,
  active,
}: {
  budget: Budget
  onSelect: () => void
  active: boolean
}) {
  const total = Number(budget.totalAmountCents)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      aria-pressed={active}
      className={cn(
        "flex w-full cursor-pointer items-center gap-4 px-5 py-2.5 text-left transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active ? "bg-muted/50" : "hover:bg-muted/40",
      )}
    >
      <p className="w-32 shrink-0 truncate text-body text-foreground">
        {formatPeriodLabel(budget)}
      </p>

      <p className="min-w-0 flex-1 truncate text-caption text-muted-foreground">
        {budget.changeReason ?? ""}
      </p>

      <p className="w-32 shrink-0 text-right text-body text-foreground tabular-nums">
        <MoneyDisplay cents={String(total)} />
      </p>

      <Link
        to={`/orcamentos/${budget.id}`}
        onClick={(event) => event.stopPropagation()}
        aria-label={`Ver extrato de ${formatPeriodLabel(budget)}`}
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowRight size={13} aria-hidden />
      </Link>
    </div>
  )
}

function BudgetPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  )
}

function NoBudgetState({
  costCenterId,
  canManage,
}: {
  costCenterId: string
  canManage: boolean
}) {
  return (
    <EmptyState
      icon={Wallet}
      title="Sem orçamento definido"
      description={
        canManage
          ? "Sem um teto para o período, nenhum pedido deste centro tem saldo para consumir. Cada mês é um registro novo — o saldo não passa adiante."
          : "Sem um teto para o período, nenhum pedido deste centro tem saldo para consumir. Peça ao admin financeiro para definir o orçamento."
      }
      action={
        canManage ? (
          <CreateBudgetDialog
            costCenterId={costCenterId}
            trigger={
              <Button
                size="lg"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Plus size={15} weight="bold" aria-hidden />
                Definir orçamento
              </Button>
            }
          />
        ) : null
      }
    />
  )
}
