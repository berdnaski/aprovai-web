import { ArrowLeft, DotsThree, Warning } from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { getApiErrorMessage } from "@/api/client"
import type { CostCenterSummary } from "@/api/cost-centers"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useCostCenterBudgets } from "@/hooks/budgets/use-budgets"
import {
  useCostCenterMembers,
  useCostCentersSummary,
} from "@/hooks/cost-centers/use-cost-centers"

import { BudgetPanel } from "./components/budget-panel"
import { CostCenterDetailSkeleton } from "./components/cost-center-detail-skeleton"
import { CostCenterLifecycleDialogs } from "./components/cost-center-lifecycle-dialogs"
import { CostCentersError } from "./components/cost-centers-error"
import { CreateCostCenterDialog } from "./components/create-cost-center-dialog"
import { EditCostCenterDialog } from "./components/edit-cost-center-dialog"
import { MembersPanel } from "./components/members-panel"
import { OverviewPanel } from "./components/overview-panel"
import { readUsage } from "./usage"

export function CostCenterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [creatingChild, setCreatingChild] = useState(false)
  const [lifecycle, setLifecycle] = useState<"disable" | "delete" | null>(null)

  const summaryQuery = useCostCentersSummary({ includeDisabled: true })
  const membersQuery = useCostCenterMembers(id)
  const budgetsQuery = useCostCenterBudgets(id)

  const centers = useMemo(() => summaryQuery.data ?? [], [summaryQuery.data])
  const node = centers.find((center) => center.id === id)

  if (summaryQuery.isPending) {
    return <CostCenterDetailSkeleton />
  }

  if (summaryQuery.isError) {
    return (
      <CostCentersError
        title="Não foi possível carregar este Centro de Custo"
        message={getApiErrorMessage(summaryQuery.error)}
        onRetry={() => void summaryQuery.refetch()}
      />
    )
  }

  if (!node) {
    return (
      <CostCentersError
        title="Centro de Custo não encontrado"
        message="Ele pode ter sido excluído ou você não tem acesso a ele."
        onRetry={() => void navigate("/centros-de-custo")}
      />
    )
  }

  const parent = node.parentId
    ? centers.find((center) => center.id === node.parentId)
    : undefined
  const children = centers.filter((center) => center.parentId === node.id)

  const members = membersQuery.data ?? []
  const budgets = budgetsQuery.data ?? []
  const usage = readUsage(node)

  return (
    <div className="flex flex-col gap-8">
      <DetailHeader
        node={node}
        parent={parent}
        onEdit={() => setEditing(true)}
        onCreateChild={() => setCreatingChild(true)}
        onDisable={() => setLifecycle("disable")}
        onDelete={() => setLifecycle("delete")}
      />

      {usage?.overBudget ? (
        <p className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-label font-normal text-foreground">
          <Warning
            size={16}
            weight="fill"
            className="mt-px shrink-0 text-destructive"
            aria-hidden
          />
          <span>
            Este centro passou o orçamento do período em{" "}
            <MoneyDisplay
              cents={usage.exceededCents}
              className="font-medium text-destructive"
            />
            .{" "}
            <span className="text-muted-foreground">
              Pedidos novos continuam entrando, mas cada aprovação aumenta o
              estouro.
            </span>
          </span>
        </p>
      ) : null}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTab value="overview">Visão geral</TabsTab>
          <TabsTab value="budget">
            Orçamento
            {budgets.length > 0 ? <TabCount>{budgets.length}</TabCount> : null}
          </TabsTab>
          <TabsTab value="people">
            Pessoas
            {members.length > 0 ? <TabCount>{members.length}</TabCount> : null}
          </TabsTab>
          <TabsIndicator />
        </TabsList>

        <TabsPanel value="overview">
          <OverviewPanel
            node={node}
            parent={parent}
            childCenters={children}
            memberLinks={members}
          />
        </TabsPanel>

        <TabsPanel value="budget">
          <BudgetPanel costCenterId={node.id} node={node} />
        </TabsPanel>

        <TabsPanel value="people">
          <MembersPanel node={node} memberLinks={members} />
        </TabsPanel>
      </Tabs>

      <EditCostCenterDialog
        costCenter={node}
        open={editing}
        onOpenChange={setEditing}
      />

      <CreateCostCenterDialog
        defaultParentId={node.id}
        parentName={node.name}
        open={creatingChild}
        onOpenChange={setCreatingChild}
      />

      <CostCenterLifecycleDialogs
        costCenter={node}
        action={lifecycle}
        onClose={() => setLifecycle(null)}
        redirectOnSuccess
      />
    </div>
  )
}

function DetailHeader({
  node,
  parent,
  onEdit,
  onCreateChild,
  onDisable,
  onDelete,
}: {
  node: CostCenterSummary
  parent?: CostCenterSummary
  onEdit: () => void
  onCreateChild: () => void
  onDisable: () => void
  onDelete: () => void
}) {
  const { canManage: canManageArea } = usePermissions()
  const canManage = canManageArea("cost-centers")
  const disabled = Boolean(node.disabledAt)

  return (
    <header className="flex flex-col gap-5">
      <nav aria-label="Você está em">
        <Link
          to="/centros-de-custo"
          className="group inline-flex items-center gap-1.5 text-caption text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={13}
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
            aria-hidden
          />
          Centros de Custo
        </Link>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {parent ? (
            <p className="mb-1.5 text-caption text-muted-foreground">
              dentro de{" "}
              <Link
                to={`/centros-de-custo/${parent.id}`}
                className="text-foreground underline decoration-border underline-offset-3 transition-colors hover:decoration-foreground"
              >
                {parent.name}
              </Link>
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-display text-foreground">{node.name}</h1>
            {node.code ? (
              <span className="text-subhead text-muted-foreground tabular-nums">
                {node.code}
              </span>
            ) : null}
            {disabled ? (
              <span className="rounded bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                Inativo
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-subhead text-muted-foreground">
            Gerido por{" "}
            <span className="text-foreground">
              {node.managerName ?? "sem gestor definido"}
            </span>
            <span aria-hidden className="px-2 text-border">
              /
            </span>
            {node.memberCount === 0
              ? "ninguém vinculado"
              : `${node.memberCount} ${node.memberCount === 1 ? "pessoa" : "pessoas"}`}
          </p>
        </div>

        {canManage ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              onClick={onEdit}
              className="h-9 font-medium"
            >
              Editar
            </Button>

            <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Mais ações de ${node.name}`}
                  className="size-9 text-muted-foreground"
                />
              }
            >
              <DotsThree size={18} weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onCreateChild}>
                Criar centro filho
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!disabled ? (
                <DropdownMenuItem variant="destructive" onClick={onDisable}>
                  Inativar centro
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                Excluir centro
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>
    </header>
  )
}

function TabCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-muted px-1.5 text-caption text-muted-foreground tabular-nums">
      {children}
    </span>
  )
}
