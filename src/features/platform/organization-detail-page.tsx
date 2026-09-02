import { ArrowLeft, Sliders, ArrowsLeftRight } from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import { getApiErrorMessage } from "@/api/client"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization, usePlans } from "@/hooks/platform/use-platform"
import { formatCnpj } from "@/lib/cnpj"
import { cn } from "@/lib/utils"
import {
  PLAN_TIER_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  SubscriptionStatus,
} from "@/types/enums"

import { AssignPlanDialog } from "./components/assign-plan-dialog"
import { OverrideDialog } from "./components/override-dialog"

function fullDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [assigning, setAssigning] = useState(false)
  const [overriding, setOverriding] = useState(false)

  const organization = useOrganization(id)
  const plans = usePlans()

  if (organization.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (organization.isError || !organization.data) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <LoadError message={getApiErrorMessage(organization.error)} />
      </div>
    )
  }

  const item = organization.data
  const seatLimit = item.plan?.maxMembers ?? null
  const seatsOver = seatLimit !== null && item.usedSeats >= seatLimit

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        to="/plataforma/organizacoes"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={13} aria-hidden />
        Organizações
      </Link>

      <PageHeader
        title={item.tradeName ?? item.legalName}
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-subhead tabular-nums text-muted-foreground">
              {formatCnpj(item.cnpj)}
            </span>
            {item.disabledAt ? (
              <StatusPill tone="danger">Inativa</StatusPill>
            ) : null}
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setOverriding(true)}
              disabled={item.subscriptionStatus === null}
              className="h-9 gap-1.5 bg-card font-medium"
            >
              <Sliders size={14} aria-hidden />
              Exceção
            </Button>

            <Button
              onClick={() => setAssigning(true)}
              className="h-9 gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <ArrowsLeftRight size={14} aria-hidden />
              {item.plan ? "Trocar plano" : "Atribuir plano"}
            </Button>
          </div>
        }
      />

      <SettingGroup
        title="Assinatura"
        description="O que esta organização contratou."
      >
        <SettingRow
          label="Plano"
          control={
            item.plan ? (
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-body text-foreground">
                  {item.plan.name}
                </span>
                <span className="text-caption text-muted-foreground">
                  {PLAN_TIER_LABELS[item.plan.tier] ?? item.plan.tier}
                </span>
              </span>
            ) : (
              <span className="text-body text-muted-foreground">
                Nenhum plano atribuído
              </span>
            )
          }
        />

        <SettingRow
          label="Situação"
          control={
            item.subscriptionStatus ? (
              <StatusPill
                tone={
                  item.subscriptionStatus === SubscriptionStatus.ACTIVE
                    ? "success"
                    : item.subscriptionStatus === SubscriptionStatus.TRIALING
                      ? "brand"
                      : "warning"
                }
              >
                {SUBSCRIPTION_STATUS_LABELS[item.subscriptionStatus]}
              </StatusPill>
            ) : (
              <span className="text-body text-muted-foreground">—</span>
            )
          }
        />

        <SettingRow
          label="Mensalidade"
          control={
            item.plan ? (
              <MoneyDisplay cents={item.plan.priceCents} emphasis />
            ) : (
              <span className="text-body text-muted-foreground">—</span>
            )
          }
        />

        <SettingRow
          label="Vagas"
          hint={
            seatsOver
              ? "No limite. Novos convites são recusados até liberarem vaga."
              : undefined
          }
          control={
            <span
              className={cn(
                "text-body tabular-nums",
                seatsOver ? "font-medium text-warning-strong" : "text-foreground",
              )}
            >
              {item.usedSeats}
              {seatLimit === null ? " (ilimitado)" : ` de ${seatLimit}`}
            </span>
          }
        />
      </SettingGroup>

      <SettingGroup title="Cadastro">
        <SettingRow
          label="Razão social"
          control={
            <span className="text-body text-muted-foreground">
              {item.legalName}
            </span>
          }
        />
        <SettingRow
          label="Onboarding"
          control={
            <span className="text-body text-muted-foreground">
              {item.onboardingStep === "DONE"
                ? "Concluído"
                : "Em andamento"}
            </span>
          }
        />
        <SettingRow
          label="Cliente desde"
          control={
            <span className="text-body text-muted-foreground">
              {fullDate(item.createdAt)}
            </span>
          }
        />
      </SettingGroup>

      <AssignPlanDialog
        organization={item}
        plans={plans.data ?? []}
        open={assigning}
        onOpenChange={setAssigning}
      />

      <OverrideDialog
        organization={item}
        current={[]}
        open={overriding}
        onOpenChange={setOverriding}
      />
    </div>
  )
}
