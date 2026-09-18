import { FileText, Receipt, Wallet } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import { EmptyState } from "@/components/shared/empty-state"
import { MoneyDisplay } from "@/components/shared/money-display"
import { StatusPill } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { usePayables } from "@/hooks/payables/use-payables"
import { usePurchaseRequests } from "@/hooks/purchase-requests/use-purchase-requests"
import { useInvoices } from "@/hooks/invoices/use-invoices"
import { RequestView } from "@/types/enums"

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function HistorySection({
  title,
  icon: Icon,
  isLoading,
  empty,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  isLoading: boolean
  empty: boolean
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-11 items-center border-b border-border px-4">
        <h2 className="text-overline text-muted-foreground">{title}</h2>
      </header>

      {isLoading ? (
        <div className="p-4">
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      ) : empty ? (
        <EmptyState
          variant="inline"
          icon={Icon}
          title="Nada por aqui ainda"
          className="min-h-32 py-8"
        />
      ) : (
        <ul className="divide-y divide-border/50">{children}</ul>
      )}
    </section>
  )
}

export function SupplierHistoryTab({ supplierId }: { supplierId: string }) {
  const requestsQuery = usePurchaseRequests({
    view: RequestView.ALL,
    supplierId,
    perPage: 8,
  })
  const invoicesQuery = useInvoices({ supplierId, perPage: 8 })
  const payablesQuery = usePayables({ supplierId, perPage: 8 })

  const requests = requestsQuery.data?.items ?? []
  const invoices = invoicesQuery.data?.items ?? []
  const payables = payablesQuery.data?.items ?? []

  return (
    <div className="flex flex-col gap-4">
      <HistorySection
        title="Pedidos de compra"
        icon={FileText}
        isLoading={requestsQuery.isPending}
        empty={requests.length === 0}
      >
        {requests.map((request) => (
          <li key={request.id}>
            <Link
              to={`/pedidos/${request.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <span className="min-w-0 truncate text-caption text-foreground">
                <span className="tabular-nums text-muted-foreground">
                  {request.number}
                </span>{" "}
                {request.title}
              </span>
              <MoneyDisplay
                cents={request.totalAmountCents}
                className="shrink-0 text-caption font-medium text-foreground"
              />
            </Link>
          </li>
        ))}
      </HistorySection>

      <HistorySection
        title="Notas fiscais"
        icon={Receipt}
        isLoading={invoicesQuery.isPending}
        empty={invoices.length === 0}
      >
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <Link
              to={`/conferencia/notas/${invoice.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <span className="min-w-0 truncate text-caption text-foreground">
                <span className="tabular-nums text-muted-foreground">
                  NF {invoice.number}
                </span>{" "}
                {DATE.format(new Date(invoice.issuedAt))}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <StatusPill tone="neutral">{invoice.status}</StatusPill>
                <MoneyDisplay
                  cents={invoice.totalAmountCents}
                  className="text-caption font-medium text-foreground"
                />
              </span>
            </Link>
          </li>
        ))}
      </HistorySection>

      <HistorySection
        title="Contas a pagar"
        icon={Wallet}
        isLoading={payablesQuery.isPending}
        empty={payables.length === 0}
      >
        {payables.map((payable) => (
          <li
            key={payable.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span className="text-caption tabular-nums text-muted-foreground">
              vence {DATE.format(new Date(payable.dueDate))}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <StatusPill tone="neutral">{payable.status}</StatusPill>
              <MoneyDisplay
                cents={payable.amountCents}
                className="text-caption font-medium text-foreground"
              />
            </span>
          </li>
        ))}
      </HistorySection>
    </div>
  )
}
