import { CaretRight, DotsThree } from "@phosphor-icons/react"
import { useState } from "react"
import { Link } from "react-router-dom"

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
import { usePermissions } from "@/hooks/auth/use-permissions"
import { cn } from "@/lib/utils"

import { CostCenterLifecycleDialogs } from "./cost-center-lifecycle-dialogs"
import { CreateCostCenterDialog } from "./create-cost-center-dialog"
import { EditCostCenterDialog } from "./edit-cost-center-dialog"
import { readUsage } from "../usage"

export function CostCenterCard({
  node,
  depth = 0,
}: {
  node: CostCenterSummary
  depth?: number
}) {
  const [editing, setEditing] = useState(false)
  const [creatingChild, setCreatingChild] = useState(false)
  const [lifecycle, setLifecycle] = useState<"disable" | "delete" | null>(null)

  const { canManage: canManageArea } = usePermissions()
  const canManage = canManageArea("cost-centers")

  const usage = readUsage(node)
  const alert = usage?.overBudget ?? false
  const disabled = Boolean(node.disabledAt)

  return (
    <div className={cn("group/row relative", depth > 0 && "pl-7 sm:pl-10")}>
      {depth > 0 ? (
        <>
          <span
            aria-hidden
            className="absolute top-0 left-3 h-1/2 w-px bg-border sm:left-4"
          />
          <span
            aria-hidden
            className="absolute top-1/2 left-3 h-px w-4 bg-border sm:left-4 sm:w-6"
          />
        </>
      ) : null}

      <Link
        to={`/centros-de-custo/${node.id}`}
        className={cn(
          "relative flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors duration-150",
          "hover:border-foreground/15 hover:bg-muted/40",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          disabled && "opacity-50",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-medium text-foreground">
              {node.name}
            </span>
            {node.code ? (
              <span className="shrink-0 text-caption text-muted-foreground tabular-nums">
                {node.code}
              </span>
            ) : null}
            {disabled ? (
              <span className="shrink-0 rounded bg-muted px-1.5 text-caption text-muted-foreground">
                Inativo
              </span>
            ) : null}
          </div>

          <p className="mt-1 truncate text-caption text-muted-foreground">
            {node.managerName ?? "sem gestor"}
            <span aria-hidden className="px-1.5 text-border">
              /
            </span>
            {node.memberCount}{" "}
            {node.memberCount === 1 ? "pessoa" : "pessoas"}
            {node.openRequests > 0 ? (
              <>
                <span aria-hidden className="px-1.5 text-border">
                  /
                </span>
                {node.openRequests}{" "}
                {node.openRequests === 1 ? "pedido aberto" : "pedidos abertos"}
              </>
            ) : null}
          </p>
        </div>

        <div className="hidden w-32 shrink-0 sm:block">
          {usage ? (
            <>
              <div
                className={cn(
                  "flex h-1.5 overflow-hidden rounded-full",
                  alert ? "bg-chart-4/15" : "bg-chart-1/15",
                )}
              >
                <div
                  className={cn("h-full", alert ? "bg-chart-4" : "bg-chart-1")}
                  style={{ width: `${usage.committedPercent}%` }}
                />
                <div
                  className={cn(
                    "h-full",
                    alert ? "bg-destructive/40" : "bg-chart-3",
                  )}
                  style={{ width: `${usage.underReviewPercent}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-caption text-muted-foreground tabular-nums">
                {usage.percent}%
              </p>
            </>
          ) : null}
        </div>

        <div className="w-32 shrink-0 text-right">
          {usage ? (
            <>
              <p
                className={cn(
                  "text-body font-medium tabular-nums",
                  alert ? "text-destructive" : "text-foreground",
                )}
              >
                <MoneyDisplay
                  cents={alert ? usage.exceededCents : usage.availableCents}
                />
              </p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                {alert ? "acima do teto" : "disponível"}
              </p>
            </>
          ) : (
            <p className="text-caption text-muted-foreground">sem orçamento</p>
          )}
        </div>

        <CaretRight
          size={14}
          className="shrink-0 text-muted-foreground/40 transition-transform duration-150 group-hover/row:translate-x-0.5 group-hover/row:text-muted-foreground"
          aria-hidden
        />
      </Link>

      <div
        className={cn(
          "absolute top-1/2 right-11 -translate-y-1/2",
          !canManage && "hidden",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Ações de ${node.name}`}
                className="size-7 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
              />
            }
          >
            <DotsThree size={16} weight="bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              Editar dados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCreatingChild(true)}>
              Criar centro filho
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!disabled ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setLifecycle("disable")}
              >
                Inativar centro
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setLifecycle("delete")}
            >
              Excluir centro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
      />
    </div>
  )
}
