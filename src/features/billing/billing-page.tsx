import { Check, Minus, Warning } from "@phosphor-icons/react"

import { getApiErrorMessage } from "@/api/client"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useAvailablePlans, useSubscription } from "@/hooks/billing/use-billing"
import { cn } from "@/lib/utils"
import {
  PLAN_TIER_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  SubscriptionStatus,
} from "@/types/enums"

const FEATURE_LABELS: Record<string, string> = {
  "ai-extraction": "Extração assistida por IA",
  "email-approval": "Aprovação por e-mail",
  "advanced-reports": "Relatórios avançados",
}

function fullDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function storageLabel(bytes: string | null): string {
  if (bytes === null) {
    return "Ilimitado"
  }

  const gigabytes = Number(bytes) / 1024 ** 3

  return `${gigabytes >= 1 ? Math.round(gigabytes) : gigabytes.toFixed(1).replace(".", ",")} GB`
}

export function BillingPage() {
  const subscription = useSubscription()
  const plans = useAvailablePlans()

  if (subscription.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6" aria-busy>
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (subscription.isError || !subscription.data) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PageHeader title="Plano e assinatura" />
        <LoadError
          message={getApiErrorMessage(subscription.error)}
          onRetry={() => void subscription.refetch()}
        />
      </div>
    )
  }

  const data = subscription.data
  const current = data.plan

  const requestLimit = data.maxRequestsMonth
  const requestPercent =
    requestLimit === null
      ? 0
      : Math.round((data.usedRequestsMonth / requestLimit) * 100)
  const requestsTight = requestLimit !== null && requestPercent >= 80
  const requestsFull =
    requestLimit !== null && data.usedRequestsMonth >= requestLimit

  const seatLimit = data.maxMembers
  const seatsFull = seatLimit !== null && data.usedSeats >= seatLimit

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title="Plano e assinatura"
        description="O que sua empresa contratou e quanto do limite já usa."
      />

      {requestsFull || seatsFull ? (
        <section className="flex items-start gap-3 rounded-lg border border-warning/25 bg-warning/[0.06] px-5 py-4">
          <Warning
            size={16}
            weight="fill"
            aria-hidden
            className="mt-px shrink-0 text-warning-strong"
          />
          <div>
            <p className="text-caption font-medium text-foreground">
              {requestsFull
                ? "Os pedidos do mês acabaram"
                : "As vagas do plano acabaram"}
            </p>
            <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
              {requestsFull
                ? "Novos pedidos não podem ser enviados até o dia 1º, quando o contador zera. Fale com a gente para subir de plano agora."
                : "Novos convites são recusados até alguém sair ou o plano subir."}
            </p>
          </div>
        </section>
      ) : null}

      <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-5 py-4">
          <div className="flex min-w-0 flex-col">
            <p className="text-overline text-muted-foreground/70">
              Plano atual
            </p>
            <p className="text-heading text-foreground">
              {current?.name ?? "Sem plano"}
            </p>
          </div>

          {data.status ? (
            <StatusPill
              tone={
                data.status === SubscriptionStatus.ACTIVE
                  ? "success"
                  : data.status === SubscriptionStatus.TRIALING
                    ? "brand"
                    : "warning"
              }
            >
              {SUBSCRIPTION_STATUS_LABELS[data.status]}
            </StatusPill>
          ) : null}

          {current ? (
            <p className="ml-auto flex items-baseline gap-1.5">
              <MoneyDisplay
                cents={current.priceCents}
                emphasis
                className="text-heading"
              />
              <span className="text-caption text-muted-foreground">por mês</span>
            </p>
          ) : null}
        </header>

        <div className="grid divide-y divide-border/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex flex-col gap-2 px-5 py-4">
            <p className="text-caption text-muted-foreground">
              Pedidos neste mês
            </p>
            <p className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-display tabular-nums",
                  requestsTight ? "text-warning-strong" : "text-foreground",
                )}
              >
                {data.usedRequestsMonth}
              </span>
              <span className="text-caption text-muted-foreground">
                {requestLimit === null ? "sem limite" : `de ${requestLimit}`}
              </span>
            </p>

            {requestLimit !== null ? (
              <span
                role="img"
                aria-label={`${requestPercent}% dos pedidos do mês usados`}
                className="h-1.5 w-full overflow-hidden rounded-xs bg-muted"
              >
                <span
                  className={cn(
                    "block h-full rounded-xs",
                    requestsFull
                      ? "bg-destructive"
                      : requestsTight
                        ? "bg-warning"
                        : "bg-chart-1",
                  )}
                  style={{ width: `${Math.min(requestPercent, 100)}%` }}
                />
              </span>
            ) : null}

            <p className="text-caption text-muted-foreground">
              O contador zera no dia 1º.
            </p>
          </div>

          <div className="flex flex-col gap-2 px-5 py-4">
            <p className="text-caption text-muted-foreground">Pessoas</p>
            <p className="flex items-baseline gap-1.5">
              <span className="text-display tabular-nums text-foreground">
                {data.usedSeats}
              </span>
              <span className="text-caption text-muted-foreground">
                {seatLimit === null ? "sem limite" : `de ${seatLimit}`}
              </span>
            </p>
            <p className="text-caption leading-relaxed text-muted-foreground">
              {seatLimit === null
                ? "Convide quantas pessoas quiser: a cobrança não é por usuário."
                : "Convites são recusados quando lota."}
            </p>
          </div>

          <div className="flex flex-col gap-2 px-5 py-4">
            <p className="text-caption text-muted-foreground">Anexos</p>
            <p className="text-display tabular-nums text-foreground">
              {storageLabel(current?.maxStorageBytes ?? null)}
            </p>
          </div>
        </div>

        {data.renewsAt ? (
          <footer className="border-t border-border bg-muted/25 px-5 py-3">
            <p className="text-caption text-muted-foreground">
              {data.status === SubscriptionStatus.TRIALING
                ? `O período de teste vai até ${fullDate(data.renewsAt)}.`
                : `Renova em ${fullDate(data.renewsAt)}.`}
            </p>
          </footer>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-label text-foreground">Planos disponíveis</h2>
          <p className="text-caption text-muted-foreground">
            Para mudar de plano, fale com a gente.
          </p>
        </div>

        {plans.isPending ? (
          <Skeleton className="h-56 w-full rounded-lg" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(plans.data ?? []).map((plan) => {
              const active = plan.id === current?.id
              const allFeatures = Object.keys(FEATURE_LABELS)

              return (
                <article
                  key={plan.id}
                  className={cn(
                    "flex flex-col gap-4 rounded-lg border bg-card px-5 py-5",
                    active
                      ? "border-primary/40 shadow-xs ring-1 ring-primary/15"
                      : "border-border shadow-xs",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-overline text-muted-foreground/70">
                        {PLAN_TIER_LABELS[plan.tier] ?? plan.tier}
                      </p>
                      <p className="text-heading text-foreground">
                        {plan.name}
                      </p>
                    </div>

                    {active ? (
                      <StatusPill tone="brand">Seu plano</StatusPill>
                    ) : null}
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
                      {plan.maxRequestsMonth === null
                        ? "Pedidos ilimitados"
                        : `${plan.maxRequestsMonth} pedidos por mês`}
                    </li>
                    <li className="text-caption text-muted-foreground">
                      {plan.maxMembers === null
                        ? "Pessoas ilimitadas"
                        : `Até ${plan.maxMembers} pessoas`}
                    </li>
                    <li className="text-caption text-muted-foreground">
                      {storageLabel(plan.maxStorageBytes)} de anexos
                    </li>
                  </ul>

                  <ul className="flex flex-col gap-1.5 border-t border-border pt-4">
                    {allFeatures.map((feature) => {
                      const included = plan.features.includes(feature)

                      return (
                        <li
                          key={feature}
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
                            <Minus
                              size={13}
                              aria-hidden
                              className="mt-0.5 shrink-0"
                            />
                          )}
                          {FEATURE_LABELS[feature]}
                        </li>
                      )
                    })}
                  </ul>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
