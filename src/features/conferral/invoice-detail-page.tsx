import {
  DownloadSimple,
  LinkSimple,
  Prohibit,
  Scales,
  SealCheck,
  WarningCircle,
} from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { PageBreadcrumbs } from "@/components/shared/page-breadcrumbs"
import { getApiErrorMessage } from "@/api/client"
import { invoiceXmlUrl } from "@/api/invoices"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useInvoice,
  useLinkInvoice,
  useRejectInvoice,
} from "@/hooks/invoices/use-invoices"
import { useRunMatch } from "@/hooks/matching/use-matching"
import {
  usePurchaseOrder,
  usePurchaseOrders,
} from "@/hooks/purchase-orders/use-purchase-orders"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { LinkRecurringContractPanel } from "./components/link-recurring-contract-panel"
import { formatCnpj, onlyDigits } from "@/lib/cnpj"
import { formatCents } from "@/lib/money"
import { INVOICE_STATUS } from "@/lib/status-labels"
import { cn } from "@/lib/utils"
import { InvoiceStatus, PurchaseOrderStatus } from "@/types/enums"

function fullDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [linking, setLinking] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState(false)

  const invoiceQuery = useInvoice(id)
  const ordersQuery = usePurchaseOrders({ perPage: 100 })
  const suppliersQuery = useSuppliers({ perPage: 100 })
  const linkedOrderQuery = usePurchaseOrder(
    invoiceQuery.data?.purchaseOrderId ?? undefined,
  )
  const link = useLinkInvoice(id ?? "")
  const reject = useRejectInvoice(id ?? "")
  const match = useRunMatch()

  if (invoiceQuery.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    )
  }

  if (invoiceQuery.isError || !invoiceQuery.data) {
    return <LoadError message={getApiErrorMessage(invoiceQuery.error)} />
  }

  const invoice = invoiceQuery.data
  const orders = ordersQuery.data?.items ?? []
  const linkedOrder = orders.find((order) => order.id === invoice.purchaseOrderId)

  const suppliers = suppliersQuery.data?.items ?? []
  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]))
  const issuerCnpj = onlyDigits(invoice.issuerCnpj)
  const invoiceTotal = BigInt(invoice.totalAmountCents)

  const candidates = orders
    .filter(
      (order) =>
        order.status !== PurchaseOrderStatus.CANCELED &&
        order.status !== PurchaseOrderStatus.CLOSED,
    )
    .map((order) => {
      const supplier = supplierById.get(order.supplierId)
      const difference = BigInt(order.totalAmountCents) - invoiceTotal

      return {
        order,
        supplierLabel: supplier?.tradeName ?? supplier?.legalName ?? "Fornecedor",
        sameSupplier: supplier ? onlyDigits(supplier.cnpj) === issuerCnpj : false,
        sameTotal: difference === 0n,
        distance: difference < 0n ? -difference : difference,
      }
    })
    .sort((left, right) => {
      if (left.sameSupplier !== right.sameSupplier) {
        return left.sameSupplier ? -1 : 1
      }

      return left.distance < right.distance ? -1 : left.distance > right.distance ? 1 : 0
    })
    .slice(0, 8)

  const chosen = candidates.find((candidate) => candidate.order.id === linking)

  const orderItems = linkedOrderQuery.data?.items ?? []
  const orderItemById = new Map(orderItems.map((item) => [item.id, item]))
  const invoiceItems = invoice.items ?? []
  const linkedCount = invoiceItems.filter((item) => item.purchaseOrderItemId).length

  const canMatch =
    invoice.purchaseOrderId !== null &&
    invoice.status === InvoiceStatus.RECEIVED
  const canReject = invoice.status !== InvoiceStatus.REJECTED

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageBreadcrumbs
        items={[
        { label: "Conferência", to: "/conferencia" },
        { label: "Notas recebidas", to: "/conferencia/notas" },
        { label: `Nota ${invoice.number}` },
        ]}
      />

      <PageHeader
        title={`Nota ${invoice.number}${invoice.series ? `-${invoice.series}` : ""}`}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge map={INVOICE_STATUS} value={invoice.status} />
            <MoneyDisplay
              cents={invoice.totalAmountCents}
              emphasis
              className="text-subhead"
            />
            <span className="text-subhead text-muted-foreground">
              {invoice.issuerName}
            </span>
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canMatch ? (
              <Button
                size="lg"
                disabled={match.isPending}
                onClick={() =>
                  match.mutate(invoice.id, {
                    onSuccess: (result) => {
                      toast.success("Conferência concluída.")
                      navigate(`/conferencia/resultado/${result.id}`)
                    },
                    onError: (error) =>
                      toast.error(getApiErrorMessage(error)),
                  })
                }
                className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
              >
                <Scales size={15} aria-hidden />
                {match.isPending ? "Conferindo…" : "Rodar conferência"}
              </Button>
            ) : null}

            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={invoiceXmlUrl(invoice.id)}
                  download={`NFe-${invoice.accessKey}.xml`}
                />
              }
              className="gap-1.5 font-medium"
            >
              <DownloadSimple size={15} aria-hidden />
              Baixar XML
            </Button>

            {canReject ? (
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setRejecting(true)}
                className="gap-1.5 font-medium text-muted-foreground hover:text-destructive"
              >
                <Prohibit size={15} aria-hidden />
                Rejeitar
              </Button>
            ) : null}
          </div>
        }
      />

      <section
        className={cn(
          "flex items-start gap-3 rounded-lg border px-5 py-4",
          invoice.authorizationStatus === "AUTHORIZED" &&
            invoice.environment === "PRODUCTION"
            ? "border-brand-accent/25 bg-brand-accent/[0.06]"
            : "border-warning/25 bg-warning/[0.06]",
        )}
      >
        {invoice.authorizationStatus === "AUTHORIZED" &&
        invoice.environment === "PRODUCTION" ? (
          <SealCheck
            size={17}
            aria-hidden
            className="mt-px shrink-0 text-brand-accent-strong"
          />
        ) : (
          <WarningCircle
            size={17}
            aria-hidden
            className="mt-px shrink-0 text-warning-strong"
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-caption font-medium text-foreground">
            {invoice.authorizationStatus === "AUTHORIZED"
              ? invoice.environment === "HOMOLOGATION"
                ? "Autorizada em homologação, sem valor fiscal"
                : "Autorizada pela SEFAZ"
              : "Sem autorização da SEFAZ"}
          </p>

          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
            {invoice.protocolNumber
              ? `Protocolo ${invoice.protocolNumber}${
                  invoice.protocolReceivedAt
                    ? ` em ${new Date(invoice.protocolReceivedAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                    : ""
                }`
              : (invoice.protocolReason ??
                "O XML não trouxe protocolo de autorização.")}
          </p>

          <p className="mt-1.5 text-micro leading-relaxed text-muted-foreground/70">
            Lido do próprio arquivo enviado. O sistema não consulta a SEFAZ, então
            um cancelamento posterior não aparece aqui.
          </p>

          {invoice.integrityWarnings.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {invoice.integrityWarnings.map((warning) => (
                <li
                  key={warning}
                  className="flex items-start gap-1.5 text-caption leading-relaxed text-warning-strong"
                >
                  <WarningCircle
                    size={12}
                    aria-hidden
                    className="mt-0.5 shrink-0"
                  />
                  {warning}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {invoice.purchaseOrderId === null &&
      invoice.status === InvoiceStatus.RECEIVED ? (
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
          <header className="flex items-start gap-3 border-b border-border px-5 py-4">
            <LinkSimple
              size={16}
              aria-hidden
              className="mt-0.5 shrink-0 text-warning-strong"
            />
            <div className="min-w-0">
              <p className="text-caption font-medium text-foreground">
                Ligue a nota à ordem de compra
              </p>
              <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
                Cada item da nota é casado com o item pedido. Sem isso, a
                conferência não tem com o que comparar.
              </p>
            </div>
          </header>

          {candidates.length === 0 ? (
            <p className="px-5 py-4 text-caption text-muted-foreground">
              Nenhuma ordem de compra aberta para vincular.
            </p>
          ) : (
            <fieldset>
              <legend className="sr-only">Ordem de compra</legend>
              <ul className="divide-y divide-border">
                {candidates.map((candidate) => {
                  const active = candidate.order.id === linking

                  return (
                    <li key={candidate.order.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors",
                          active ? "bg-muted/50" : "hover:bg-muted/30",
                        )}
                      >
                        <input
                          type="radio"
                          name="order"
                          value={candidate.order.id}
                          checked={active}
                          onChange={() => setLinking(candidate.order.id)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border bg-card transition-colors",
                            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                            active ? "border-primary" : "border-input",
                          )}
                        >
                          {active ? (
                            <span className="size-2 rounded-full bg-primary" />
                          ) : null}
                        </span>

                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex flex-wrap items-center gap-2 text-caption font-medium text-foreground">
                            {candidate.order.number}
                            {candidate.sameSupplier ? (
                              <StatusPill tone="success">Mesmo fornecedor</StatusPill>
                            ) : null}
                          </span>
                          <span className="truncate text-caption text-muted-foreground">
                            {candidate.supplierLabel}
                          </span>
                        </span>

                        <span className="flex shrink-0 flex-col items-end gap-0.5">
                          <MoneyDisplay
                            cents={candidate.order.totalAmountCents}
                            emphasis
                            className="text-caption"
                          />
                          <span
                            className={cn(
                              "text-micro tabular-nums",
                              candidate.sameTotal
                                ? "text-brand-accent-strong"
                                : "text-muted-foreground",
                            )}
                          >
                            {candidate.sameTotal
                              ? "Mesmo valor da nota"
                              : `Nota: ${formatCents(invoice.totalAmountCents)}`}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </fieldset>
          )}

          <footer className="flex items-center justify-end border-t border-border bg-muted/20 px-5 py-3">
            <Button
              disabled={!chosen || link.isPending}
              onClick={() => {
                if (!chosen) {
                  return
                }

                link.mutate(chosen.order.id, {
                  onSuccess: (linked) => {
                    const total = linked.items?.length ?? 0
                    const matched =
                      linked.items?.filter((item) => item.purchaseOrderItemId)
                        .length ?? 0

                    toast.success(
                      `Nota vinculada à ${chosen.order.number}: ${matched} de ${total} itens casados.`,
                    )
                    setLinking(null)
                  },
                  onError: (error) => toast.error(getApiErrorMessage(error)),
                })
              }}
              className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <LinkSimple size={14} aria-hidden />
              {link.isPending
                ? "Vinculando…"
                : chosen
                  ? `Vincular à ${chosen.order.number}`
                  : "Escolha uma ordem"}
            </Button>
          </footer>
        </section>
      ) : null}

      {invoice.purchaseOrderId === null &&
      invoice.status === InvoiceStatus.RECEIVED ? (
        <LinkRecurringContractPanel invoice={invoice} suppliers={suppliers} />
      ) : null}

      {invoice.rejectReason ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-5 py-4 text-caption leading-relaxed text-foreground"
        >
          <span className="font-medium">Motivo da rejeição:</span>{" "}
          {invoice.rejectReason}
        </p>
      ) : null}

      <SettingGroup title="Dados da nota">
        <SettingRow
          label="Emitente"
          control={
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-caption text-foreground">
                {invoice.issuerName}
              </span>
              <span className="text-caption tabular-nums text-muted-foreground">
                {formatCnpj(invoice.issuerCnpj)}
              </span>
            </span>
          }
        />
        <SettingRow
          label="Emitida em"
          control={
            <span className="text-caption text-foreground">
              {fullDate(invoice.issuedAt)}
            </span>
          }
        />
        <SettingRow
          label="Ordem vinculada"
          control={
            linkedOrder ? (
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  to={`/ordens-de-compra/${linkedOrder.id}`}
                  className="text-caption font-medium text-primary underline-offset-2 hover:underline"
                >
                  {linkedOrder.number}
                </Link>
                {invoiceItems.length > 0 ? (
                  <span
                    className={cn(
                      "text-caption tabular-nums",
                      linkedCount === invoiceItems.length
                        ? "text-muted-foreground"
                        : "text-warning-strong",
                    )}
                  >
                    {linkedCount} de {invoiceItems.length}{" "}
                    {invoiceItems.length === 1 ? "item casado" : "itens casados"}
                  </span>
                ) : null}
              </span>
            ) : (
              <StatusPill tone="warning">Sem vínculo</StatusPill>
            )
          }
        />
        <SettingRow
          label="Chave de acesso"
          control={
            <span className="text-caption break-all tabular-nums text-muted-foreground">
              {invoice.accessKey}
            </span>
          }
        />
      </SettingGroup>

      {invoice.items && invoice.items.length > 0 ? (
        <SettingGroup title="Itens da nota" count={invoice.items.length}>
          {invoice.items.map((item) => {
            const orderItem = item.purchaseOrderItemId
              ? orderItemById.get(item.purchaseOrderItemId)
              : undefined
            const details = [
              item.ncm ? `NCM ${item.ncm}` : null,
              orderItem ? `Na ordem: ${orderItem.description}` : null,
            ]
              .filter(Boolean)
              .join(" · ")

            return (
              <SettingRow
                key={item.id}
                label={item.description}
                description={details || undefined}
                control={
                  <div className="flex w-full flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="text-caption tabular-nums text-muted-foreground">
                      {item.quantity} {item.unit} ×{" "}
                      <MoneyDisplay cents={item.unitPriceCents} />
                    </span>
                    {invoice.purchaseOrderId && !item.purchaseOrderItemId ? (
                      <StatusPill tone="warning">Fora da ordem</StatusPill>
                    ) : null}
                    <MoneyDisplay
                      cents={item.totalCents}
                      emphasis
                      className="ml-auto"
                    />
                  </div>
                }
              />
            )
          })}
        </SettingGroup>
      ) : null}

      {invoice.taxes && invoice.taxes.length > 0 ? (
        <SettingGroup title="Impostos" count={invoice.taxes.length}>
          {invoice.taxes.map((tax) => (
            <SettingRow
              key={tax.kind}
              label={tax.kind}
              description={`${tax.rate}% sobre ${formatBase(tax.baseCents)}`}
              control={
                <MoneyDisplay cents={tax.amountCents} className="ml-auto" />
              }
            />
          ))}
        </SettingGroup>
      ) : null}

      <ConfirmDialog
        open={rejecting}
        onOpenChange={setRejecting}
        title={`Rejeitar a nota ${invoice.number}?`}
        description="A nota é marcada como recusada e não segue para pagamento. O fornecedor precisa ser avisado por fora."
        confirmLabel={reject.isPending ? "Rejeitando…" : "Rejeitar nota"}
        cancelLabel="Voltar"
        isPending={reject.isPending}
        reason={{
          label: "Motivo",
          placeholder: "Por que esta nota não pode ser aceita?",
          required: true,
          minLength: 10,
        }}
        onConfirm={(value) =>
          reject.mutate(value ?? "", {
            onSuccess: () => toast.success("Nota rejeitada."),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      />
    </div>
  )
}

function formatBase(cents: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(cents) / 100)
}
