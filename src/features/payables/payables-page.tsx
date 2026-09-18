import { FileText, LockOpen, Plus, Table, Wallet } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Payable } from "@/api/payables"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  RowAction,
  StatusPill,
  TableSegments,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  usePayPayable,
  usePayables,
  useReleasePayable,
} from "@/hooks/payables/use-payables"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { PAYABLE_STATUS } from "@/lib/status-labels"
import { cn } from "@/lib/utils"
import {
  PAYABLE_RELEASE_REASON_LABELS,
  PayableStatus,
  type PayableReleaseReason,
} from "@/types/enums"

import { PayableAllocationDialog } from "./components/allocation-dialog"
import { ReleaseDialog } from "./components/release-dialog"

const PER_PAGE = 25

const EMPTY: Record<string, { title: string; description: string }> = {
  [PayableStatus.RELEASED]: {
    title: "Nada pronto para pagar",
    description:
      "Uma conta aparece aqui quando a nota passa na conferência e o pagamento é liberado.",
  },
  [PayableStatus.BLOCKED]: {
    title: "Nada esperando liberação",
    description:
      "Quando a conferência de uma nota bate, a conta espera aqui até alguém do financeiro liberar.",
  },
  [PayableStatus.PAID]: {
    title: "Nada pago ainda",
    description: "As contas marcadas como pagas ficam guardadas aqui.",
  },
}

function todayUtc(): number {
  const now = new Date()
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
}

function isOverdue(payable: Payable): boolean {
  return (
    payable.status !== PayableStatus.PAID &&
    new Date(payable.dueDate).getTime() < todayUtc()
  )
}

export function PayablesPage() {
  const navigate = useNavigate()

  const [filter, setFilter] = useState<PayableStatus>(PayableStatus.RELEASED)
  const [page, setPage] = useState(1)
  const [releasingWithoutInvoice, setReleasingWithoutInvoice] = useState(false)
  const [releasing, setReleasing] = useState<Payable | null>(null)
  const [paying, setPaying] = useState<Payable | null>(null)
  const [allocating, setAllocating] = useState<Payable | null>(null)

  const payablesQuery = usePayables({
    page,
    perPage: PER_PAGE,
    status: [filter],
  })
  const releasedCount = usePayables({
    perPage: 1,
    status: [PayableStatus.RELEASED],
  })
  const blockedCount = usePayables({
    perPage: 1,
    status: [PayableStatus.BLOCKED],
  })

  const suppliersQuery = useSuppliers({ perPage: 100 })
  const pay = usePayPayable()
  const release = useReleasePayable()

  const supplierName = new Map(
    (suppliersQuery.data?.items ?? []).map((item) => [
      item.id,
      item.tradeName ?? item.legalName,
    ]),
  )

  const columns: DataTableColumn<Payable>[] = [
    {
      id: "supplier",
      header: "Fornecedor",
      cell: (payable) => (
        <span className="truncate text-caption font-medium text-foreground">
          {supplierName.get(payable.supplierId) ?? "Fornecedor"}
        </span>
      ),
    },
    {
      id: "reason",
      header: "Origem",
      hideBelow: "lg",
      width: "190px",
      cell: (payable) =>
        payable.releaseReason ? (
          <StatusPill
            tone={payable.releaseReason === "MATCHED" ? "success" : "warning"}
          >
            {
              PAYABLE_RELEASE_REASON_LABELS[
                payable.releaseReason as PayableReleaseReason
              ]
            }
          </StatusPill>
        ) : payable.invoiceId ? (
          <StatusPill tone="success">Conferência bateu</StatusPill>
        ) : (
          <span className="text-caption text-muted-foreground">—</span>
        ),
    },
    {
      id: "status",
      header: "Situação",
      width: "140px",
      cell: (payable) => (
        <StatusBadge map={PAYABLE_STATUS} value={payable.status} />
      ),
    },
    {
      id: "due",
      header: "Vencimento",
      align: "end",
      width: "120px",
      cell: (payable) => {
        const overdue = isOverdue(payable)

        return (
          <span
            className={cn(
              "flex flex-col items-end text-caption tabular-nums",
              overdue ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {new Date(payable.dueDate).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              timeZone: "UTC",
            })}
            {overdue ? (
              <span className="text-micro font-medium">Vencida</span>
            ) : null}
          </span>
        )
      },
    },
    {
      id: "amount",
      header: "Valor",
      align: "end",
      width: "130px",
      cell: (payable) => <MoneyDisplay cents={payable.amountCents} emphasis />,
    },
  ]

  if (payablesQuery.isPending && !payablesQuery.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-4 w-80" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (payablesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Contas a pagar" />
        <LoadError onRetry={() => void payablesQuery.refetch()} />
      </div>
    )
  }

  const rows = payablesQuery.data?.items ?? []
  const meta = payablesQuery.data?.meta
  const empty = EMPTY[filter] ?? EMPTY[PayableStatus.PAID]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contas a pagar"
        description="Tudo que passou pela conferência: libere, pague e acompanhe o que vence."
        action={
          <Button
            size="lg"
            onClick={() => setReleasingWithoutInvoice(true)}
            className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Plus size={15} weight="bold" aria-hidden />
            Liberar sem nota fiscal
          </Button>
        }
      />

      <section className="flex flex-col gap-3">
        <TableToolbar>
          <TableSegments
            value={filter}
            onChange={(next) => {
              setFilter(next)
              setPage(1)
            }}
            segments={[
              {
                id: PayableStatus.RELEASED,
                label: "Prontas para pagar",
                count: releasedCount.data?.meta.total,
                tone: "success",
              },
              {
                id: PayableStatus.BLOCKED,
                label: "Aguardando liberação",
                count: blockedCount.data?.meta.total,
                tone: "warning",
              },
              { id: PayableStatus.PAID, label: "Pagas" },
            ]}
          />
        </TableToolbar>

        {filter === PayableStatus.BLOCKED && rows.length > 0 ? (
          <p className="text-caption leading-relaxed text-muted-foreground">
            A nota destas contas já passou na conferência. O pagamento só vai
            para &quot;Prontas para pagar&quot; depois que alguém do financeiro
            liberar.
          </p>
        ) : null}

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="contas"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0} {meta?.total === 1 ? "conta" : "contas"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(payable) => payable.id}
            rowActions={(payable) => (
              <div className="flex items-center justify-end gap-0.5">
                {payable.invoiceId ? (
                  <RowAction
                    icon={FileText}
                    label="Ver nota"
                    onClick={() =>
                      navigate(`/conferencia/notas/${payable.invoiceId}`)
                    }
                  />
                ) : null}
                {payable.status === PayableStatus.BLOCKED ? (
                  <RowAction
                    icon={LockOpen}
                    label="Liberar pagamento"
                    onClick={() => setReleasing(payable)}
                  />
                ) : null}
                {payable.status === PayableStatus.RELEASED ? (
                  <RowAction
                    icon={Wallet}
                    label="Marcar como paga"
                    onClick={() => setPaying(payable)}
                  />
                ) : null}
                <RowAction
                  icon={Table}
                  label="Rateio"
                  onClick={() => setAllocating(payable)}
                />
              </div>
            )}
            empty={
              <EmptyState
                variant="inline"
                icon={Wallet}
                title={empty.title}
                description={empty.description}
              />
            }
          />
        </DataTableShell>
      </section>

      <ReleaseDialog
        open={releasingWithoutInvoice}
        onOpenChange={setReleasingWithoutInvoice}
      />

      <PayableAllocationDialog
        payable={allocating}
        open={allocating !== null}
        onOpenChange={(next) => {
          if (!next) {
            setAllocating(null)
          }
        }}
      />

      <ConfirmDialog
        open={releasing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setReleasing(null)
          }
        }}
        variant="default"
        title="Liberar este pagamento?"
        description={
          releasing ? (
            <>
              A nota de{" "}
              {supplierName.get(releasing.supplierId) ?? "este fornecedor"}{" "}
              passou na conferência. Ao liberar,{" "}
              <MoneyDisplay cents={releasing.amountCents} emphasis /> vai para
              &quot;Prontas para pagar&quot;.
            </>
          ) : (
            ""
          )
        }
        confirmLabel={release.isPending ? "Liberando…" : "Liberar pagamento"}
        cancelLabel="Voltar"
        isPending={release.isPending}
        reason={{
          label: "Observação (opcional)",
          placeholder: "Ex.: conferido com o boleto do fornecedor",
          required: false,
        }}
        onConfirm={(note) => {
          if (!releasing) {
            return
          }

          release.mutate(
            { id: releasing.id, note },
            {
              onSuccess: () => {
                toast.success("Pagamento liberado.")
                setReleasing(null)
              },
              onError: (error) => toast.error(getApiErrorMessage(error)),
            },
          )
        }}
      />

      <ConfirmDialog
        open={paying !== null}
        onOpenChange={(next) => {
          if (!next) {
            setPaying(null)
          }
        }}
        variant="default"
        title="Marcar como paga?"
        description="Isto é um registro: o AprovAI não executa transferência. Marque depois de pagar pelo banco."
        confirmLabel={pay.isPending ? "Registrando…" : "Marcar como paga"}
        cancelLabel="Voltar"
        isPending={pay.isPending}
        onConfirm={() => {
          if (!paying) {
            return
          }

          pay.mutate(paying.id, {
            onSuccess: () => {
              toast.success("Pagamento registrado.")
              setPaying(null)
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }}
      />
    </div>
  )
}
