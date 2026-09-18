import {
  DownloadSimple,
  Prohibit,
  SealCheck,
  WarningCircle,
} from "@phosphor-icons/react"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { serviceInvoiceXmlUrl } from "@/api/service-invoices"
import { PageBreadcrumbs } from "@/components/shared/page-breadcrumbs"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/auth/use-permissions"
import { useRejectServiceInvoice, useServiceInvoice } from "@/hooks/service-invoices/use-service-invoices"
import { formatCnpj } from "@/lib/cnpj"
import { SERVICE_INVOICE_STATUS } from "@/lib/status-labels"
import { ServiceInvoiceStatus } from "@/types/enums"

import { ApproveServiceInvoiceDialog } from "./components/approve-service-invoice-dialog"

const WITHHOLDING_LABEL: Record<string, string> = {
  IRRF: "IRRF",
  INSS: "INSS",
  PIS: "PIS",
  COFINS: "COFINS",
  CSLL: "CSLL",
  ISS_RETIDO: "ISS retido",
}

function fullDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function ServiceInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { areaAccess } = usePermissions()
  const canManage = areaAccess("service-invoices") === "full"

  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const serviceInvoiceQuery = useServiceInvoice(id)
  const reject = useRejectServiceInvoice(id ?? "")

  if (serviceInvoiceQuery.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    )
  }

  if (serviceInvoiceQuery.isError || !serviceInvoiceQuery.data) {
    return <LoadError message={getApiErrorMessage(serviceInvoiceQuery.error)} />
  }

  const invoice = serviceInvoiceQuery.data
  const canAct = canManage && invoice.status === ServiceInvoiceStatus.RECEIVED
  const withholdings = invoice.withholdings ?? []
  const totalWithheldCents = withholdings.reduce(
    (sum, item) => sum + BigInt(item.amountCents),
    0n,
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageBreadcrumbs
        items={[
          { label: "Notas de serviço", to: "/notas-de-servico" },
          { label: `Nota ${invoice.number}` },
        ]}
      />

      <PageHeader
        title={`Nota de serviço ${invoice.number}`}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge map={SERVICE_INVOICE_STATUS} value={invoice.status} />
            <MoneyDisplay
              cents={invoice.netAmountCents}
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
            {canAct ? (
              <Button
                size="lg"
                onClick={() => setApproving(true)}
                className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
              >
                <SealCheck size={15} aria-hidden />
                Aprovar
              </Button>
            ) : null}

            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={serviceInvoiceXmlUrl(invoice.id)}
                  download={`NFSe-${invoice.accessKey}.xml`}
                />
              }
              className="gap-1.5 font-medium"
            >
              <DownloadSimple size={15} aria-hidden />
              Baixar XML
            </Button>

            {canAct ? (
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

      {invoice.integrityWarnings.length > 0 ? (
        <section className="flex items-start gap-3 rounded-lg border border-warning/25 bg-warning/[0.06] px-5 py-4">
          <WarningCircle
            size={17}
            aria-hidden
            className="mt-px shrink-0 text-warning-strong"
          />
          <div className="min-w-0 flex-1">
            <p className="text-caption font-medium text-foreground">
              Pontos que pedem conferência manual
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {invoice.integrityWarnings.map((warning) => (
                <li
                  key={warning}
                  className="text-caption leading-relaxed text-warning-strong"
                >
                  {warning}
                </li>
              ))}
            </ul>
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

      <SettingGroup title="Prestador e serviço">
        <SettingRow
          label="Prestador"
          control={
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-caption text-foreground">
                {invoice.issuerName || "Não informado no XML"}
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
          label="Serviço"
          control={
            <span className="text-caption text-foreground">
              {invoice.serviceDescription || "Sem descrição no XML"}
            </span>
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

      <SettingGroup title="Valores">
        <SettingRow
          label="Valor bruto do serviço"
          control={<MoneyDisplay cents={invoice.grossAmountCents} className="ml-auto" />}
        />
        {BigInt(invoice.discountCents) > 0n ? (
          <SettingRow
            label="Descontos"
            control={<MoneyDisplay cents={invoice.discountCents} className="ml-auto" />}
          />
        ) : null}
        {withholdings.map((item) => (
          <SettingRow
            key={item.kind}
            label={WITHHOLDING_LABEL[item.kind] ?? item.kind}
            description={item.rate !== "0.00" ? `${item.rate}%` : undefined}
            control={<MoneyDisplay cents={item.amountCents} className="ml-auto" />}
          />
        ))}
        {withholdings.length === 0 ? (
          <SettingRow
            label="Retenções"
            control={
              <span className="ml-auto text-caption text-muted-foreground">
                Nenhuma retenção declarada nesta nota
              </span>
            }
          />
        ) : (
          <SettingRow
            label="Total retido"
            control={<MoneyDisplay cents={totalWithheldCents} emphasis className="ml-auto" />}
          />
        )}
        <SettingRow
          label="Valor líquido pago ao fornecedor"
          control={<MoneyDisplay cents={invoice.netAmountCents} emphasis className="ml-auto" />}
        />
      </SettingGroup>

      <ApproveServiceInvoiceDialog
        serviceInvoice={invoice}
        open={approving}
        onOpenChange={setApproving}
      />

      <ConfirmDialog
        open={rejecting}
        onOpenChange={setRejecting}
        title={`Rejeitar a nota ${invoice.number}?`}
        description="A nota é marcada como recusada e não gera conta a pagar."
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
