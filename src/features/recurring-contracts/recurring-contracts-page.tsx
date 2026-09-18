import { ArrowsClockwise, MagnifyingGlass, Plus } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableShell,
  StatusDot,
  TableSearch,
  TableSegments,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useRecurringContracts } from "@/hooks/recurring-contracts/use-recurring-contracts"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { RECURRING_FREQUENCY_LABELS } from "@/types/enums"
import type { RecurringContract } from "@/api/recurring-contracts"

const FILTERS = {
  ACTIVE: "ACTIVE",
  CANCELED: "CANCELED",
  ALL: "ALL",
} as const

type Filter = (typeof FILTERS)[keyof typeof FILTERS]

export function RecurringContractsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>(FILTERS.ACTIVE)

  const term = useDebouncedValue(query).trim().toLowerCase()

  const contractsQuery = useRecurringContracts()
  const suppliersQuery = useSuppliers({ perPage: 100 })

  const supplierName = new Map(
    (suppliersQuery.data?.items ?? []).map((supplier) => [
      supplier.id,
      supplier.tradeName ?? supplier.legalName,
    ]),
  )

  if (contractsQuery.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (contractsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Assinaturas recorrentes" />
        <LoadError onRetry={() => void contractsQuery.refetch()} />
      </div>
    )
  }

  const contracts = contractsQuery.data ?? []
  const activeCount = contracts.filter((item) => item.active).length
  const canceledCount = contracts.length - activeCount

  const visible = contracts.filter((contract) => {
    if (filter === FILTERS.ACTIVE && !contract.active) return false
    if (filter === FILTERS.CANCELED && contract.active) return false
    if (!term) return true

    const supplier = supplierName.get(contract.supplierId) ?? ""
    return (
      contract.title.toLowerCase().includes(term) ||
      supplier.toLowerCase().includes(term)
    )
  })

  const filtered = term.length > 0 || filter !== FILTERS.ACTIVE

  const columns: DataTableColumn<RecurringContract>[] = [
    {
      id: "title",
      header: "Assinatura",
      cell: (contract) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption font-medium text-foreground">
            {contract.title}
          </span>
          <span className="truncate text-micro text-muted-foreground/70">
            {supplierName.get(contract.supplierId) ?? "Fornecedor"}
          </span>
        </span>
      ),
    },
    {
      id: "frequency",
      header: "Frequência",
      width: "120px",
      hideBelow: "lg",
      cell: (contract) => (
        <span className="text-caption text-muted-foreground">
          {RECURRING_FREQUENCY_LABELS[contract.frequency]}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Valor por ciclo",
      align: "end",
      width: "140px",
      cell: (contract) => <MoneyDisplay cents={contract.amountCents} emphasis />,
    },
    {
      id: "status",
      header: "Situação",
      width: "110px",
      cell: (contract) => (
        <StatusDot
          tone={contract.active ? "success" : "neutral"}
          label={contract.active ? "Ativa" : "Cancelada"}
        />
      ),
    },
  ]

  const goToApprovedRequests = () => navigate("/pedidos?status=APPROVED")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assinaturas recorrentes"
        description="Pedidos aprovados que viraram cobrança contínua: o orçamento é consumido sozinho a cada ciclo, sem precisar de nova aprovação."
        action={
          <Button
            size="lg"
            variant="outline"
            onClick={goToApprovedRequests}
            className="gap-1.5 font-medium"
          >
            <Plus size={15} weight="bold" aria-hidden />
            Ver pedidos aprovados
          </Button>
        }
      />

      <section>
        <TableToolbar>
          <TableSegments
            value={filter}
            onChange={setFilter}
            segments={[
              { id: FILTERS.ACTIVE, label: "Ativas", count: activeCount, tone: "success" },
              { id: FILTERS.CANCELED, label: "Canceladas", count: canceledCount },
              { id: FILTERS.ALL, label: "Todas", count: contracts.length },
            ]}
          />

          <TableSearch
            value={query}
            onChange={setQuery}
            placeholder="Buscar por assinatura ou fornecedor"
            label="Buscar assinatura recorrente"
            className="ml-auto"
          />
        </TableToolbar>

        <DataTableShell>
          <DataTable
            columns={columns}
            rows={visible}
            rowKey={(contract) => contract.id}
            onRowClick={(contract) =>
              navigate(`/assinaturas-recorrentes/${contract.id}`)
            }
            empty={
              <EmptyState
                variant="inline"
                icon={filtered ? MagnifyingGlass : ArrowsClockwise}
                title={
                  filtered
                    ? "Nenhuma assinatura encontrada"
                    : "Nenhuma assinatura recorrente ainda"
                }
                description={
                  filtered
                    ? "Tente outro termo ou troque o filtro."
                    : "Abra um pedido já aprovado e use \"Transformar em assinatura recorrente\" no detalhe dele."
                }
                action={
                  filtered ? undefined : (
                    <Button
                      onClick={goToApprovedRequests}
                      className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
                    >
                      Ver pedidos aprovados
                    </Button>
                  )
                }
              />
            }
          />
        </DataTableShell>
      </section>
    </div>
  )
}
