import { Prohibit } from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { RecurringOccurrence } from "@/api/recurring-contracts"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageBreadcrumbs } from "@/components/shared/page-breadcrumbs"
import { StatRow, StatTile } from "@/components/shared/stat-tile"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableShell, StatusPill, type DataTableColumn } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useCostCenter } from "@/hooks/cost-centers/use-cost-centers"
import {
  useCancelRecurringContract,
  useRecurringContract,
  useRecurringOccurrences,
} from "@/hooks/recurring-contracts/use-recurring-contracts"
import { useSupplier } from "@/hooks/suppliers/use-suppliers"
import {
  RECURRING_FREQUENCY_LABELS,
  RECURRING_OCCURRENCE_STATUS_LABELS,
  RecurringOccurrenceStatus,
} from "@/types/enums"

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})

export function RecurringContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [canceling, setCanceling] = useState(false)

  const contractQuery = useRecurringContract(id)
  const occurrencesQuery = useRecurringOccurrences(id)
  const cancel = useCancelRecurringContract()

  const contract = contractQuery.data
  const supplierQuery = useSupplier(contract?.supplierId)
  const costCenterQuery = useCostCenter(contract?.costCenterId)

  if (contractQuery.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    )
  }

  if (contractQuery.isError || !contract) {
    return (
      <LoadError
        title="Assinatura não encontrada"
        message={getApiErrorMessage(contractQuery.error)}
        onRetry={() => void navigate("/assinaturas-recorrentes")}
      />
    )
  }

  const occurrences = occurrencesQuery.data ?? []
  const matchedCount = occurrences.filter(
    (item) => item.status === RecurringOccurrenceStatus.MATCHED,
  ).length
  const pending = occurrences.find(
    (item) => item.status === RecurringOccurrenceStatus.PENDING,
  )

  const columns: DataTableColumn<RecurringOccurrence>[] = [
    {
      id: "period",
      header: "Ciclo",
      cell: (occurrence) => (
        <span className="text-caption text-foreground">
          {DATE.format(new Date(occurrence.periodStart))} até{" "}
          {DATE.format(new Date(occurrence.periodEnd))}
        </span>
      ),
    },
    {
      id: "due",
      header: "Vencimento",
      width: "120px",
      cell: (occurrence) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {DATE.format(new Date(occurrence.dueDate))}
        </span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      width: "140px",
      cell: (occurrence) => (
        <StatusPill
          tone={
            occurrence.status === RecurringOccurrenceStatus.MATCHED
              ? "success"
              : "warning"
          }
        >
          {RECURRING_OCCURRENCE_STATUS_LABELS[occurrence.status]}
        </StatusPill>
      ),
    },
    {
      id: "invoice",
      header: "Nota",
      width: "120px",
      cell: (occurrence) =>
        occurrence.invoiceId ? (
          <Link
            to={`/conferencia/notas/${occurrence.invoiceId}`}
            className="text-caption text-primary underline decoration-primary/30 underline-offset-3 transition-colors hover:decoration-primary"
          >
            ver nota
          </Link>
        ) : (
          <span className="text-caption text-muted-foreground">—</span>
        ),
    },
    {
      id: "amount",
      header: "Valor esperado",
      align: "end",
      width: "140px",
      cell: (occurrence) => (
        <MoneyDisplay cents={occurrence.expectedAmountCents} emphasis />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumbs
        items={[
          { label: "Assinaturas recorrentes", to: "/assinaturas-recorrentes" },
          { label: contract.title },
        ]}
      />

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card px-5 py-4 shadow-xs lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="text-heading text-foreground">{contract.title}</h1>
            <StatusPill tone={contract.active ? "success" : "neutral"}>
              {contract.active ? "Ativa" : "Cancelada"}
            </StatusPill>
          </div>
          <p className="mt-0.5 text-caption text-muted-foreground">
            {supplierQuery.data?.tradeName ?? supplierQuery.data?.legalName ?? "Fornecedor"}
            {" · "}
            {costCenterQuery.data?.name ?? "Centro de custo"}
            {" · "}
            {RECURRING_FREQUENCY_LABELS[contract.frequency]}
          </p>
          {contract.cancelReason ? (
            <p className="mt-1 text-caption text-muted-foreground">
              Cancelada: {contract.cancelReason}
            </p>
          ) : null}
        </div>

        {contract.active ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCanceling(true)}
            className="h-8 shrink-0 gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <Prohibit size={13} aria-hidden />
            Cancelar assinatura
          </Button>
        ) : null}
      </div>

      <StatRow className="xl:grid-cols-3">
        <StatTile label="Valor por ciclo" value={<MoneyDisplay cents={contract.amountCents} />} />
        <StatTile
          label="Ciclos conferidos"
          value={matchedCount}
          hint={`de ${occurrences.length} gerados`}
        />
        <StatTile
          label="Aguardando nota"
          value={pending ? DATE.format(new Date(pending.periodStart)) : "Nenhum"}
          tone={pending ? "warning" : "neutral"}
          hint={pending ? "ciclo atual" : "tudo em dia"}
        />
      </StatRow>

      <DataTableShell title="Ciclos" count={occurrences.length}>
        <DataTable
          columns={columns}
          rows={occurrences}
          rowKey={(occurrence) => occurrence.id}
          isLoading={occurrencesQuery.isPending}
        />
      </DataTableShell>

      <ConfirmDialog
        open={canceling}
        onOpenChange={setCanceling}
        variant="destructive"
        title="Cancelar esta assinatura?"
        description="Para de gerar cobrança nos próximos ciclos. Os ciclos já gerados continuam como estão."
        confirmLabel={cancel.isPending ? "Cancelando…" : "Cancelar assinatura"}
        isPending={cancel.isPending}
        reason={{
          label: "Motivo",
          placeholder: "Ex.: empresa cancelou o plano com o fornecedor",
          required: true,
          minLength: 10,
        }}
        onConfirm={(reason) => {
          if (!reason || !id) return

          cancel.mutate(
            { id, reason },
            {
              onSuccess: () => {
                toast.success("Assinatura cancelada.")
                setCanceling(false)
              },
              onError: (error) => toast.error(getApiErrorMessage(error)),
            },
          )
        }}
      />
    </div>
  )
}
