import { ArrowLeft, Check, SealCheck, WarningCircle } from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useInvoice } from "@/hooks/invoices/use-invoices"
import {
  useMatchResult,
  useOverrideMatch,
} from "@/hooks/matching/use-matching"
import { usePurchaseOrder } from "@/hooks/purchase-orders/use-purchase-orders"
import { MATCH_STATUS } from "@/lib/status-labels"
import {
  DIVERGENCE_KIND_LABELS,
  MatchStatus,
  type DivergenceKind,
} from "@/types/enums"

import { MatchComparison } from "./components/match-comparison"

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [overriding, setOverriding] = useState(false)

  const matchQuery = useMatchResult(id)
  const result = matchQuery.data
  const invoice = useInvoice(result?.invoiceId)
  const order = usePurchaseOrder(result?.purchaseOrderId)
  const override = useOverrideMatch(id ?? "")

  if (matchQuery.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6" aria-busy>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }

  if (matchQuery.isError || !result) {
    return <LoadError message={getApiErrorMessage(matchQuery.error)} />
  }

  const divergences = result.divergences ?? []
  const canOverride = result.status === MatchStatus.DIVERGENT

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        to="/conferencia"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={13} aria-hidden />
        Conferências
      </Link>

      <PageHeader
        title={`Conferência da nota ${invoice.data?.number ?? ""}`}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge map={MATCH_STATUS} value={result.status} />
            {order.data ? (
              <Link
                to={`/ordens-de-compra/${order.data.id}`}
                className="text-subhead font-medium text-primary underline-offset-2 hover:underline"
              >
                {order.data.number}
              </Link>
            ) : null}
          </span>
        }
        action={
          canOverride ? (
            <Button
              size="lg"
              onClick={() => setOverriding(true)}
              className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <SealCheck size={15} aria-hidden />
              Liberar exceção
            </Button>
          ) : null
        }
      />

      <MatchComparison result={result} />

      {divergences.length > 0 ? (
        <SettingGroup
          title="O que não bateu"
          count={divergences.length}
          description="Cada linha compara o que era esperado com o que a nota trouxe."
        >
          {divergences.map((divergence, index) => (
            <SettingRow
              key={`${divergence.kind}-${index}`}
              label={
                DIVERGENCE_KIND_LABELS[divergence.kind as DivergenceKind] ??
                divergence.kind
              }
              control={
                <div className="flex w-full flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-caption text-muted-foreground">
                    esperado{" "}
                    <span className="tabular-nums text-foreground">
                      {divergence.expectedValue}
                    </span>
                  </span>
                  <span className="text-caption text-muted-foreground">
                    veio{" "}
                    <span className="tabular-nums text-warning-strong">
                      {divergence.actualValue}
                    </span>
                  </span>

                  {divergence.differenceCents ? (
                    <span className="ml-auto text-caption tabular-nums text-warning-strong">
                      <MoneyDisplay cents={divergence.differenceCents} />
                      {divergence.differencePercent
                        ? ` (${divergence.differencePercent}%)`
                        : ""}
                    </span>
                  ) : null}
                </div>
              }
            />
          ))}
        </SettingGroup>
      ) : (
        <p className="flex items-center gap-2 rounded-lg border border-brand-accent/25 bg-brand-accent/[0.06] px-5 py-4 text-caption text-foreground">
          <Check size={15} weight="bold" aria-hidden className="text-brand-accent-strong" />
          A nota bateu com a ordem dentro das tolerâncias da empresa.
        </p>
      )}

      {result.resolutionNote ? (
        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-5 py-4 text-caption leading-relaxed text-foreground">
          <WarningCircle
            size={15}
            aria-hidden
            className="mt-px shrink-0 text-muted-foreground"
          />
          <span>
            <span className="font-medium">Exceção liberada:</span>{" "}
            {result.resolutionNote}
          </span>
        </p>
      ) : null}

      <ConfirmDialog
        open={overriding}
        onOpenChange={setOverriding}
        variant="default"
        title="Liberar exceção e aprovar o pagamento?"
        description="As divergências ficam registradas, mas a nota segue para pagamento. Sua justificativa fica na trilha de auditoria."
        confirmLabel={override.isPending ? "Liberando…" : "Liberar exceção"}
        cancelLabel="Voltar"
        isPending={override.isPending}
        reason={{
          label: "Justificativa",
          placeholder: "Por que esta divergência é aceitável?",
          required: true,
          minLength: 10,
        }}
        onConfirm={(note) =>
          override.mutate(note ?? "", {
            onSuccess: () => toast.success("Exceção liberada."),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      />
    </div>
  )
}
