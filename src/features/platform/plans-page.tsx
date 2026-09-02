import { Check, Minus, PencilSimple, Plus, Stack } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { PlanWithUsage } from "@/api/platform"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/data-table"
import {
  useFeatureCatalog,
  usePlans,
  useUpdatePlan,
} from "@/hooks/platform/use-platform"
import { cn } from "@/lib/utils"
import { PLAN_TIER_LABELS } from "@/types/enums"

import { PlanDialog } from "./components/plan-dialog"

function limit(value: number | null, unit: string): string {
  return value === null ? `${unit} ilimitados` : `${value} ${unit}`
}

function storage(bytes: string | null): string {
  if (bytes === null) {
    return "Armazenamento ilimitado"
  }

  const gigabytes = Number(bytes) / 1024 ** 3

  return `${gigabytes >= 1 ? Math.round(gigabytes) : gigabytes.toFixed(1).replace(".", ",")} GB de anexos`
}

function ActiveToggle({ plan }: { plan: PlanWithUsage }) {
  const update = useUpdatePlan(plan.id)

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={update.isPending}
      onClick={() =>
        update.mutate(
          { active: !plan.active },
          {
            onSuccess: () =>
              toast.success(plan.active ? "Plano desativado." : "Plano ativado."),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          },
        )
      }
      className="text-muted-foreground hover:text-foreground"
    >
      {plan.active ? "Desativar" : "Ativar"}
    </Button>
  )
}

export function PlansPage() {
  const [editing, setEditing] = useState<PlanWithUsage | null>(null)
  const [creating, setCreating] = useState(false)

  const plans = usePlans()
  const catalog = useFeatureCatalog()

  if (plans.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-72 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (plans.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Planos comerciais" />
        <LoadError onRetry={() => void plans.refetch()} />
      </div>
    )
  }

  const items = plans.data ?? []
  const takenTiers = items.map((plan) => plan.tier)
  const allFeatures = (catalog.data ?? []).map((feature) => feature.key)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planos comerciais"
        description="O que cada faixa oferece e quantas organizações assinam. Cada faixa comporta um plano só."
        action={
          <Button
            onClick={() => setCreating(true)}
            disabled={takenTiers.length >= 3}
            className="h-9 gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Plus size={14} aria-hidden />
            Novo plano
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Stack}
          title="Nenhum plano cadastrado"
          description="Sem plano cadastrado não é possível atribuir assinatura a uma organização."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((plan) => (
            <section
              key={plan.id}
              className={cn(
                "flex flex-col gap-4 rounded-lg border bg-card px-5 py-5 shadow-xs",
                plan.active ? "border-border" : "border-dashed border-border",
              )}
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-overline text-muted-foreground/70">
                    {PLAN_TIER_LABELS[plan.tier] ?? plan.tier}
                  </p>
                  <h2
                    className={cn(
                      "text-heading",
                      plan.active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {plan.name}
                  </h2>
                </div>

                {plan.active ? null : (
                  <StatusPill tone="neutral">Inativo</StatusPill>
                )}
              </div>

              <p className="flex items-baseline gap-1.5">
                <MoneyDisplay
                  cents={plan.priceCents}
                  emphasis
                  className="text-display"
                />
                <span className="text-caption text-muted-foreground">
                  por mês
                </span>
              </p>

              <ul className="flex flex-col gap-1.5 border-t border-border pt-4">
                <li className="text-caption text-foreground">
                  {limit(plan.maxRequestsMonth, "pedidos por mês")}
                </li>
                <li className="text-caption text-muted-foreground">
                  {limit(plan.maxMembers, "usuários")}
                </li>
                <li className="text-caption text-muted-foreground">
                  {storage(plan.maxStorageBytes)}
                </li>
              </ul>

              <ul className="flex flex-col gap-1.5 border-t border-border pt-4">
                {allFeatures.map((key) => {
                  const included = plan.features.includes(key)
                  const label =
                    (catalog.data ?? []).find((item) => item.key === key)
                      ?.label ?? key

                  return (
                    <li
                      key={key}
                      className={cn(
                        "flex items-start gap-2 text-caption",
                        included
                          ? "text-foreground"
                          : "text-muted-foreground/50",
                      )}
                    >
                      {included ? (
                        <Check
                          size={13}
                          weight="bold"
                          aria-hidden
                          className="mt-0.5 shrink-0 text-brand-accent-strong"
                        />
                      ) : (
                        <Minus size={13} aria-hidden className="mt-0.5 shrink-0" />
                      )}
                      {label}
                    </li>
                  )
                })}
              </ul>

              <footer className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4">
                <p className="text-caption tabular-nums text-muted-foreground">
                  {plan.subscriptions}{" "}
                  {plan.subscriptions === 1 ? "assinatura" : "assinaturas"}
                </p>

                <div className="ml-auto flex items-center gap-1">
                  <ActiveToggle plan={plan} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(plan)}
                    className="gap-1.5 bg-card font-medium"
                  >
                    <PencilSimple size={13} aria-hidden />
                    Editar
                  </Button>
                </div>
              </footer>
            </section>
          ))}
        </div>
      )}

      {creating ? (
        <PlanDialog
          plan={null}
          takenTiers={takenTiers as ("BASIC" | "PROFESSIONAL" | "ENTERPRISE")[]}
          open
          onOpenChange={setCreating}
        />
      ) : null}

      {editing ? (
        <PlanDialog
          key={editing.id}
          plan={editing}
          takenTiers={takenTiers as ("BASIC" | "PROFESSIONAL" | "ENTERPRISE")[]}
          open
          onOpenChange={(next) => {
            if (!next) {
              setEditing(null)
            }
          }}
        />
      ) : null}
    </div>
  )
}
