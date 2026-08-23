import { CaretRight, Plus, Receipt, Wallet } from "@phosphor-icons/react"
import { useMemo } from "react"
import { Link } from "react-router-dom"

import type { BudgetEntry } from "@/api/budgets"
import type { CostCenterMemberLink, CostCenterSummary } from "@/api/cost-centers"
import { EmptyState } from "@/components/shared/empty-state"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useBudgetEntries,
  useCostCenterBudgets,
} from "@/hooks/budgets/use-budgets"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useCompanyMembers } from "@/hooks/cost-centers/use-cost-centers"
import { initialsOf } from "@/lib/people"
import { cn } from "@/lib/utils"

import { BudgetBurndown } from "./budget-burndown"
import { BudgetHistoryChart } from "./budget-history-chart"
import { CreateBudgetDialog } from "./create-budget-dialog"
import { EntryRow } from "./entry-row"
import { formatPeriodLabel, isCurrentPeriod } from "../period"
import { usageOf } from "../usage"

export function OverviewPanel({
  node,
  parent,
  childCenters,
  memberLinks,
}: {
  node: CostCenterSummary
  parent?: CostCenterSummary
  childCenters: CostCenterSummary[]
  memberLinks: CostCenterMemberLink[]
}) {
  const budgetsQuery = useCostCenterBudgets(node.id)
  const budgets = budgetsQuery.data ?? []
  const current = budgets.find((budget) => isCurrentPeriod(budget))

  const entriesQuery = useBudgetEntries(current?.id)
  const entries = useMemo(() => entriesQuery.data ?? [], [entriesQuery.data])

  const burndown = useMemo(() => buildBurndown(entries), [entries])

  if (!node.budget || !current) {
    return <NoBudgetState costCenterId={node.id} />
  }

  const usage = usageOf(node.budget)
  const total = Number(node.budget.totalAmountCents)
  const committed = Number(node.budget.committedCents)
  const underReview = Number(node.budget.underReviewCents)
  const overBudget = usage?.overBudget ?? false
  const percent = usage?.percent ?? 0

  const label = formatPeriodLabel(current)

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Resumo do período"
        className="rise-in grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiTile
          label="Orçado no período"
          value={node.budget.totalAmountCents}
          hint={label}
          delay={0}
        />
        <KpiTile
          label="Comprometido"
          value={node.budget.committedCents}
          badge={
            total > 0
              ? `${Math.round((committed / total) * 100)}% do teto`
              : undefined
          }
          badgeTone="primary"
          bar={total > 0 ? Math.min((committed / total) * 100, 100) : 0}
          barTone="primary"
          delay={40}
        />
        <KpiTile
          label="Aguardando decisão"
          value={node.budget.underReviewCents}
          badge={
            node.openRequests > 0 ? `${node.openRequests} na fila` : undefined
          }
          badgeTone="warning"
          hint="ainda não deduz saldo"
          delay={80}
        />
        <KpiTile
          label={overBudget ? "Acima do teto" : "Disponível"}
          value={
            overBudget
              ? (usage?.exceededCents ?? "0")
              : node.budget.availableCents
          }
          badge={overBudget ? "estouro" : `${Math.max(100 - percent, 0)}% livre`}
          badgeTone={overBudget ? "destructive" : "success"}
          hint={
            overBudget ? "cada aprovação aumenta" : "livre para novos pedidos"
          }
          delay={120}
        />
      </section>

      <section
        aria-label={`Ritmo de consumo em ${label}`}
        className="rise-in overflow-hidden rounded-lg border border-border bg-card [animation-delay:160ms]"
      >
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-label text-foreground">
              Ritmo de consumo em {label}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-caption font-medium",
                overBudget
                  ? "border-destructive/25 bg-destructive/8 text-destructive"
                  : percent >= 85
                    ? "border-warning/25 bg-warning/10 text-warning-strong"
                    : "border-brand-accent/25 bg-brand-accent/10 text-brand-accent-strong",
              )}
            >
              {percent}% usado
            </span>
          </div>

          <p className="text-caption text-muted-foreground">
            <MoneyDisplay
              cents={String(underReview)}
              className="font-medium text-foreground"
            />{" "}
            aguardando decisão
          </p>
        </header>

        <div className="px-2 py-4 sm:px-4">
          {entriesQuery.isPending ? (
            <Skeleton className="mx-3 h-44" />
          ) : (
            <BudgetBurndown
              data={burndown}
              totalCents={node.budget.totalAmountCents}
            />
          )}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_minmax(0,360px)]">
        <section
          aria-label="Últimos movimentos"
          className="rise-in flex flex-col overflow-hidden rounded-lg border border-border bg-card [animation-delay:240ms]"
        >
          <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
            <h3 className="text-label text-foreground">Últimos movimentos</h3>
            <span className="text-caption text-muted-foreground">
              {entries.length} em {label}
            </span>
          </header>

          {entriesQuery.isPending ? (
            <div className="flex flex-col gap-3 px-5 py-4">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : entries.length > 0 ? (
            <ul className="divide-y divide-border/60">
              {entries.slice(0, 6).map((entry) => (
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
          ) : (
            <EmptyState
              variant="inline"
              icon={Receipt}
              title="Nenhum movimento ainda"
              description="Quando um pedido for aprovado, ele aparece aqui consumindo o orçamento."
            />
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section
            aria-label="Consumo por período"
            className="rise-in rounded-lg border border-border bg-card p-5 [animation-delay:320ms]"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-label text-foreground">Consumo por período</h3>
              <span className="text-caption text-muted-foreground">
                % do teto
              </span>
            </div>
            <BudgetHistoryChart
              budgets={budgets}
              currentId={current.id}
              committedCents={node.budget.committedCents}
              className="mt-3"
            />
          </section>

          <TeamCard node={node} memberLinks={memberLinks} />

          <HierarchyCard
            node={node}
            parent={parent}
            childCenters={childCenters}
          />
        </div>
      </div>
    </div>
  )
}

function buildBurndown(entries: BudgetEntry[]) {
  const sorted = [...entries].sort((a, b) =>
    a.occurredAt.localeCompare(b.occurredAt),
  )

  let running = 0

  return sorted.map((entry) => {
    running += Number(entry.amountCents)
    const date = new Date(entry.occurredAt)

    return {
      label: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
      committedCents: running,
    }
  })
}

const BADGE_TONE = {
  primary: "text-primary",
  warning: "text-warning-strong",
  success: "text-brand-accent-strong",
  destructive: "text-destructive",
} as const

const BAR_TONE = {
  primary: "bg-chart-1",
  warning: "bg-chart-3",
  success: "bg-chart-2",
  destructive: "bg-chart-4",
} as const

const TRACK_TONE = {
  primary: "bg-chart-1/15",
  warning: "bg-chart-3/20",
  success: "bg-chart-2/15",
  destructive: "bg-chart-4/15",
} as const

function KpiTile({
  label,
  value,
  hint,
  badge,
  badgeTone = "primary",
  bar,
  barTone = "primary",
  delay,
}: {
  label: string
  value: string
  hint?: string
  badge?: string
  badgeTone?: keyof typeof BADGE_TONE
  bar?: number
  barTone?: keyof typeof BAR_TONE
  delay: number
}) {
  return (
    <div
      className="rise-in rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 hover:border-foreground/15"
      style={{ animationDelay: `${delay}ms` }}
      title={hint}
    >
      <p className="truncate text-caption text-muted-foreground">{label}</p>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <p className="text-heading text-foreground tabular-nums">
          <MoneyDisplay cents={value} />
        </p>
        {badge ? (
          <span
            className={cn(
              "text-caption font-medium tabular-nums",
              BADGE_TONE[badgeTone],
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {bar !== undefined ? (
        <div
          className={cn(
            "mt-2 h-1 overflow-hidden rounded-full",
            TRACK_TONE[barTone],
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
              BAR_TONE[barTone],
            )}
            style={{ width: `${bar}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

function TeamCard({
  node,
  memberLinks,
}: {
  node: CostCenterSummary
  memberLinks: CostCenterMemberLink[]
}) {
  const { data: members = [] } = useCompanyMembers()
  const byId = new Map(members.map((member) => [member.id, member]))

  const manager = byId.get(node.managerId)
  const others = memberLinks.filter((link) => link.memberId !== node.managerId)
  const shown = others.slice(0, 4)
  const rest = others.length - shown.length

  return (
    <section
      aria-label="Quem abre pedidos aqui"
      className="rise-in rounded-lg border border-border bg-card p-5 [animation-delay:360ms]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-label text-foreground">Quem abre pedidos aqui</h3>
        {node.openRequests > 0 ? (
          <span className="text-caption text-muted-foreground tabular-nums">
            {node.openRequests} {node.openRequests === 1 ? "aberto" : "abertos"}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-caption font-medium text-primary"
        >
          {initialsOf(manager?.user?.name ?? node.managerName ?? "?")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body text-foreground">
            {manager?.user?.name ?? node.managerName ?? "Gestor"}
          </p>
          <p className="text-caption text-muted-foreground">
            gestor, aprova os pedidos daqui
          </p>
        </div>
      </div>

      {others.length > 0 ? (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {shown.map((link) => {
              const member = byId.get(link.memberId)

              return (
                <span
                  key={link.id}
                  title={member?.user?.name ?? ""}
                  className="flex size-7 items-center justify-center rounded-full bg-muted text-caption font-medium text-muted-foreground ring-2 ring-card"
                >
                  {initialsOf(member?.user?.name ?? "?")}
                </span>
              )
            })}
            {rest > 0 ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-muted text-caption font-medium text-muted-foreground ring-2 ring-card tabular-nums">
                +{rest}
              </span>
            ) : null}
          </div>
          <p className="min-w-0 flex-1 text-caption text-muted-foreground">
            {others.length} {others.length === 1 ? "pessoa" : "pessoas"}{" "}
            vinculadas
          </p>
        </div>
      ) : (
        <p className="mt-3 text-caption text-muted-foreground">
          Ninguém vinculado. Só o gestor e o admin financeiro abrem pedidos aqui.
        </p>
      )}
    </section>
  )
}

function HierarchyCard({
  node,
  parent,
  childCenters,
}: {
  node: CostCenterSummary
  parent?: CostCenterSummary
  childCenters: CostCenterSummary[]
}) {
  if (!parent && childCenters.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Posição na hierarquia"
      className="rise-in rounded-lg border border-border bg-card p-5 [animation-delay:400ms]"
    >
      <h3 className="text-label text-foreground">Posição na hierarquia</h3>

      <ul className="mt-3 flex flex-col gap-0.5">
        {parent ? (
          <li>
            <Link
              to={`/centros-de-custo/${parent.id}`}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="truncate text-body text-muted-foreground group-hover:text-foreground">
                {parent.name}
              </span>
              <CaretRight
                size={12}
                className="ml-auto shrink-0 text-muted-foreground/50"
                aria-hidden
              />
            </Link>
          </li>
        ) : null}

        <li
          className={cn(
            "flex items-center gap-2 rounded-md border-l-2 border-primary bg-primary/6 px-2 py-1.5",
            parent && "ml-3",
          )}
        >
          <span className="truncate text-body font-medium text-foreground">
            {node.name}
          </span>
          <span className="ml-auto shrink-0 text-caption text-primary">
            aqui
          </span>
        </li>

        {childCenters.map((child) => (
          <li key={child.id} className={cn(parent ? "ml-6" : "ml-3")}>
            <Link
              to={`/centros-de-custo/${child.id}`}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="truncate text-body text-muted-foreground group-hover:text-foreground">
                {child.name}
              </span>
              {child.code ? (
                <span className="shrink-0 text-caption text-muted-foreground/70 tabular-nums">
                  {child.code}
                </span>
              ) : null}
              <CaretRight
                size={12}
                className="ml-auto shrink-0 text-muted-foreground/50"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function NoBudgetState({ costCenterId }: { costCenterId: string }) {
  const { canManage: canManageArea } = usePermissions()
  const canManage = canManageArea("cost-centers")

  return (
    <section className="rise-in rounded-lg border border-warning/25 bg-card">
      <div className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/12 text-warning-strong"
          >
            <Wallet size={18} />
          </span>
          <div>
            <p className="text-heading text-foreground">
              Sem orçamento no período
            </p>
            <p className="mt-1.5 max-w-md text-body text-muted-foreground">
              Sem um teto para o período, nenhum pedido deste centro tem saldo
              para consumir. Cada mês é um registro novo — o saldo não passa
              adiante.
            </p>
          </div>
        </div>

        {canManage ? (
          <CreateBudgetDialog
            costCenterId={costCenterId}
            trigger={
              <Button
                size="lg"
                className="shrink-0 gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Plus size={15} weight="bold" aria-hidden />
                Definir orçamento
              </Button>
            }
          />
        ) : null}
      </div>
    </section>
  )
}
