import { MagnifyingGlass, Receipt, UploadSimple } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import type { ServiceInvoice } from "@/api/service-invoices"
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
  TableSearch,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useServiceInvoices } from "@/hooks/service-invoices/use-service-invoices"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatCnpj } from "@/lib/cnpj"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { SERVICE_INVOICE_STATUS } from "@/lib/status-labels"
import { ServiceInvoiceStatus } from "@/types/enums"

import { UploadServiceInvoiceDialog } from "./components/upload-service-invoice-dialog"

const PER_PAGE = 25

function fullDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function ServiceInvoicesPage() {
  const navigate = useNavigate()
  const { areaAccess } = usePermissions()
  const canUpload = areaAccess("service-invoices") === "full"

  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)

  const search = useDebouncedValue(query).trim()

  const serviceInvoicesQuery = useServiceInvoices({
    page,
    perPage: PER_PAGE,
    ...(search ? { search } : {}),
  })

  const columns: DataTableColumn<ServiceInvoice>[] = [
    {
      id: "number",
      header: "Nota",
      cell: (invoice) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption font-medium tabular-nums text-foreground">
            {invoice.number}
          </span>
          <span className="truncate text-micro text-muted-foreground/70">
            {invoice.issuerName}
          </span>
        </span>
      ),
    },
    {
      id: "issuer",
      header: "CNPJ prestador",
      hideBelow: "xl",
      width: "170px",
      cell: (invoice) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {formatCnpj(invoice.issuerCnpj)}
        </span>
      ),
    },
    {
      id: "issued",
      header: "Emitida em",
      hideBelow: "lg",
      width: "130px",
      cell: (invoice) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {fullDate(invoice.issuedAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      width: "140px",
      cell: (invoice) => (
        <StatusBadge map={SERVICE_INVOICE_STATUS} value={invoice.status} />
      ),
    },
    {
      id: "gross",
      header: "Bruto",
      align: "end",
      width: "120px",
      cell: (invoice) => <MoneyDisplay cents={invoice.grossAmountCents} />,
    },
    {
      id: "net",
      header: "Líquido",
      align: "end",
      width: "120px",
      cell: (invoice) => (
        <MoneyDisplay cents={invoice.netAmountCents} emphasis />
      ),
    },
  ]

  if (serviceInvoicesQuery.isPending && !serviceInvoicesQuery.data) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <PageHeader
          title="Notas de serviço"
          description="NFS-e recebidas, com retenção calculada a partir da própria nota."
        />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (serviceInvoicesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Notas de serviço" />
        <LoadError onRetry={() => void serviceInvoicesQuery.refetch()} />
      </div>
    )
  }

  const rows = serviceInvoicesQuery.data?.items ?? []
  const meta = serviceInvoicesQuery.data?.meta
  const filtered = search.length > 0

  const uploadAction = canUpload ? (
    <Button
      size="lg"
      onClick={() => setUploading(true)}
      className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
    >
      <UploadSimple size={15} aria-hidden />
      Enviar nota
    </Button>
  ) : undefined

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notas de serviço"
        description="NFS-e recebidas, com retenção calculada a partir da própria nota. Ao aprovar, gera a conta a pagar já pelo valor líquido."
        action={uploadAction}
      />

      <section>
        <TableToolbar>
          <TableSearch
            value={query}
            onChange={(next) => {
              setQuery(next)
              setPage(1)
            }}
            placeholder="Buscar por número"
            label="Buscar nota de serviço"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="notas"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0} {meta?.total === 1 ? "nota" : "notas"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(invoice) => invoice.id}
            onRowClick={(invoice) =>
              navigate(`/notas-de-servico/${invoice.id}`)
            }
            rowAccent={(invoice) =>
              invoice.status === ServiceInvoiceStatus.REJECTED
                ? "danger"
                : undefined
            }
            empty={
              <EmptyState
                variant="inline"
                icon={filtered ? MagnifyingGlass : Receipt}
                title={
                  filtered ? "Nenhuma nota encontrada" : "Nenhuma nota de serviço"
                }
                description={
                  filtered
                    ? "Tente outro termo."
                    : "Envie o XML da NFS-e que o prestador mandou."
                }
                action={filtered ? undefined : uploadAction}
              />
            }
          />
        </DataTableShell>
      </section>

      <UploadServiceInvoiceDialog open={uploading} onOpenChange={setUploading} />
    </div>
  )
}
