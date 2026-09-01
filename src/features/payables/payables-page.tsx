import { Plus, Wallet } from "@phosphor-icons/react"
import { useState } from "react"
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
import { usePayPayable, usePayables } from "@/hooks/payables/use-payables"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { PAYABLE_STATUS } from "@/lib/status-labels"
import {
  PAYABLE_RELEASE_REASON_LABELS,
  PayableStatus,
  type PayableReleaseReason,
} from "@/types/enums"

import { ReleaseDialog } from "./components/release-dialog"

const PER_PAGE = 25

export function PayablesPage() {
  const [filter, setFilter] = useState<PayableStatus>(PayableStatus.RELEASED)
  const [page, setPage] = useState(1)
  const [releasing, setReleasing] = useState(false)
  const [paying, setPaying] = useState<Payable | null>(null)

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
      header: "Liberação",
      hideBelow: "lg",
      width: "190px",
      cell: (payable) =>
        payable.releaseReason ? (
          <StatusPill
            tone={
              payable.releaseReason === "MATCHED" ? "success" : "warning"
            }
          >
            {
              PAYABLE_RELEASE_REASON_LABELS[
                payable.releaseReason as PayableReleaseReason
              ]
            }
          </StatusPill>
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
      cell: (payable) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {new Date(payable.dueDate).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      ),
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contas a pagar"
        description="O que já passou pela conferência e está pronto para sair."
        action={
          <Button
            size="lg"
            onClick={() => setReleasing(true)}
            className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Plus size={15} weight="bold" aria-hidden />
            Liberar sem nota fiscal
          </Button>
        }
      />

      <section>
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
                label: "Travadas",
                count: blockedCount.data?.meta.total,
                tone: "warning",
              },
              { id: PayableStatus.PAID, label: "Pagas" },
            ]}
          />
        </TableToolbar>

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
            rowActions={
              filter === PayableStatus.RELEASED
                ? (payable) => (
                    <RowAction
                      icon={Wallet}
                      label="Marcar como paga"
                      onClick={() => setPaying(payable)}
                    />
                  )
                : undefined
            }
            empty={
              <EmptyState
                variant="inline"
                icon={Wallet}
                title={
                  filter === PayableStatus.RELEASED
                    ? "Nada pronto para pagar"
                    : filter === PayableStatus.BLOCKED
                      ? "Nada travado"
                      : "Nada pago ainda"
                }
                description={
                  filter === PayableStatus.RELEASED
                    ? "Uma conta aparece aqui quando a conferência da nota bate."
                    : "As contas travadas esperam a conferência ser resolvida."
                }
              />
            }
          />
        </DataTableShell>
      </section>

      <ReleaseDialog open={releasing} onOpenChange={setReleasing} />

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
