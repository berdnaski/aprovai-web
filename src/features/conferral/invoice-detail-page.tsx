import {
  ArrowLeft,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useInvoice,
  useLinkInvoice,
  useRejectInvoice,
} from "@/hooks/invoices/use-invoices"
import { useRunMatch } from "@/hooks/matching/use-matching"
import { usePurchaseOrders } from "@/hooks/purchase-orders/use-purchase-orders"
import { formatCnpj } from "@/lib/cnpj"
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

  const openOrders = orders.filter(
    (order) =>
      order.status !== PurchaseOrderStatus.CANCELED &&
      order.status !== PurchaseOrderStatus.CLOSED,
  )

  const canMatch =
    invoice.purchaseOrderId !== null &&
    invoice.status === InvoiceStatus.RECEIVED
  const canReject = invoice.status !== InvoiceStatus.REJECTED

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        to="/conferencia/notas"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={13} aria-hidden />
        Notas recebidas
      </Link>

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

      {invoice.purchaseOrderId === null ? (
        <section className="flex flex-col gap-3 rounded-lg border border-warning/25 bg-warning/[0.06] px-5 py-4">
          <div>
            <p className="text-caption font-medium text-foreground">
              Esta nota não está vinculada a nenhuma ordem
            </p>
            <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
              Sem vínculo não dá para conferir contra o que foi pedido e
              recebido.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={linking}
              onValueChange={(next) => setLinking((next ?? null) as string | null)}
            >
              <SelectTrigger
                className="h-9 w-64 bg-card px-3"
                aria-label="Ordem de compra"
              >
                <SelectValue>
                  {(value: string | null) =>
                    value
                      ? (orders.find((order) => order.id === value)?.number ??
                        "Ordem")
                      : "Escolher ordem"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {openOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="lg"
              disabled={!linking || link.isPending}
              onClick={() =>
                link.mutate(linking as string, {
                  onSuccess: () => toast.success("Nota vinculada à ordem."),
                  onError: (error) => toast.error(getApiErrorMessage(error)),
                })
              }
              className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <LinkSimple size={15} aria-hidden />
              {link.isPending ? "Vinculando…" : "Vincular"}
            </Button>
          </div>
        </section>
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
              <Link
                to={`/ordens-de-compra/${linkedOrder.id}`}
                className="text-caption font-medium text-primary underline-offset-2 hover:underline"
              >
                {linkedOrder.number}
              </Link>
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
          {invoice.items.map((item) => (
            <SettingRow
              key={item.id}
              label={item.description}
              description={item.ncm ? `NCM ${item.ncm}` : undefined}
              control={
                <div className="flex w-full flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-caption tabular-nums text-muted-foreground">
                    {item.quantity} {item.unit} ×{" "}
                    <MoneyDisplay cents={item.unitPriceCents} />
                  </span>
                  <MoneyDisplay
                    cents={item.totalCents}
                    emphasis
                    className="ml-auto"
                  />
                </div>
              }
            />
          ))}
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
