import { ArrowLeft, PaperPlaneTilt, Prohibit, Truck } from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
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
import { usePermissions } from "@/hooks/auth/use-permissions"
import {
  useCancelPurchaseOrder,
  useOrderBalance,
  usePurchaseOrder,
  useSendPurchaseOrder,
} from "@/hooks/purchase-orders/use-purchase-orders"
import { usePurchaseRequest } from "@/hooks/purchase-requests/use-purchase-requests"
import { useOrderReceipts } from "@/hooks/receipts/use-receipts"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { PURCHASE_ORDER_STATUS, RECEIPT_STATUS } from "@/lib/status-labels"
import { PurchaseOrderStatus } from "@/types/enums"

import { OrderBalance } from "./components/order-balance"

const OPEN: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.ISSUED,
  PurchaseOrderStatus.SENT,
  PurchaseOrderStatus.PARTIALLY_RECEIVED,
]

function dateLabel(value: string | null): string {
  if (!value) {
    return "Não informada"
  }

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isFinanceAdmin } = usePermissions()

  const [canceling, setCanceling] = useState(false)

  const orderQuery = usePurchaseOrder(id)
  const { data: balance = [] } = useOrderBalance(id)
  const { data: receipts = [] } = useOrderReceipts(id)
  const suppliersQuery = useSuppliers({ perPage: 100 })
  const send = useSendPurchaseOrder(id ?? "")
  const cancel = useCancelPurchaseOrder(id ?? "")

  const order = orderQuery.data
  const request = usePurchaseRequest(order?.purchaseRequestId)

  if (orderQuery.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    )
  }

  if (orderQuery.isError || !order) {
    return <LoadError message={getApiErrorMessage(orderQuery.error)} />
  }

  const supplier = (suppliersQuery.data?.items ?? []).find(
    (item) => item.id === order.supplierId,
  )
  const canSend = isFinanceAdmin && order.status === PurchaseOrderStatus.ISSUED
  const canCancel = isFinanceAdmin && OPEN.includes(order.status)
  const canReceive = OPEN.includes(order.status)

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/ordens-de-compra"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={13} aria-hidden />
        Ordens de compra
      </Link>

      <PageHeader
        title={order.number}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge map={PURCHASE_ORDER_STATUS} value={order.status} />
            <MoneyDisplay
              cents={order.totalAmountCents}
              emphasis
              className="text-subhead"
            />
            {supplier ? (
              <span className="text-subhead text-muted-foreground">
                {supplier.tradeName ?? supplier.legalName}
              </span>
            ) : null}
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canReceive ? (
              <Button
                size="lg"
                onClick={() => navigate(`/ordens-de-compra/${order.id}/receber`)}
                className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
              >
                <Truck size={15} aria-hidden />
                Registrar recebimento
              </Button>
            ) : null}

            {canSend ? (
              <Button
                size="lg"
                variant="outline"
                disabled={send.isPending}
                onClick={() =>
                  send.mutate(undefined, {
                    onSuccess: () =>
                      toast.success("Ordem marcada como enviada."),
                    onError: (error) => toast.error(getApiErrorMessage(error)),
                  })
                }
                className="gap-1.5 font-medium"
              >
                <PaperPlaneTilt size={15} aria-hidden />
                Marcar como enviada
              </Button>
            ) : null}

            {canCancel ? (
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setCanceling(true)}
                className="gap-1.5 font-medium text-muted-foreground hover:text-destructive"
              >
                <Prohibit size={15} aria-hidden />
                Cancelar
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <OrderBalance balance={balance} />

          {receipts.length > 0 ? (
            <SettingGroup title="Recebimentos" count={receipts.length}>
              {receipts.map((receipt) => (
                <SettingRow
                  key={receipt.id}
                  label={receipt.number}
                  description={new Date(receipt.receivedAt).toLocaleDateString(
                    "pt-BR",
                    { day: "2-digit", month: "short" },
                  )}
                  control={
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <StatusBadge
                        map={RECEIPT_STATUS}
                        value={receipt.status}
                      />
                      {receipt.hasDivergence ? (
                        <span className="text-caption text-warning-strong">
                          com divergência
                        </span>
                      ) : null}
                      <Link
                        to={`/recebimentos/${receipt.id}`}
                        className="ml-auto text-caption font-medium text-primary underline-offset-2 hover:underline"
                      >
                        Abrir
                      </Link>
                    </div>
                  }
                />
              ))}
            </SettingGroup>
          ) : null}

          {order.items && order.items.length > 0 ? (
            <SettingGroup title="Itens da ordem" count={order.items.length}>
              {order.items.map((item) => (
                <SettingRow
                  key={item.id}
                  label={item.description}
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
        </div>

        <SettingGroup title="Dados da ordem" className="h-fit">
          <SettingRow
            label="Pedido de origem"
            control={
              <Link
                to={`/pedidos/${order.purchaseRequestId}`}
                className="text-caption font-medium text-primary underline-offset-2 hover:underline"
              >
                {request.data?.number ?? "Abrir pedido"}
              </Link>
            }
          />
          <SettingRow
            label="Emitida em"
            control={
              <span className="text-caption text-foreground">
                {dateLabel(order.issuedAt)}
              </span>
            }
          />
          <SettingRow
            label="Entrega esperada"
            control={
              <span className="text-caption text-foreground">
                {dateLabel(order.expectedDeliveryAt)}
              </span>
            }
          />
          <SettingRow
            label="Enviada ao fornecedor"
            control={
              <span className="text-caption text-foreground">
                {order.sentToSupplierAt
                  ? dateLabel(order.sentToSupplierAt)
                  : "Ainda não"}
              </span>
            }
          />
          <SettingRow
            label="Endereço"
            control={
              <span className="text-caption leading-relaxed text-foreground">
                {order.deliveryAddress ?? "Não informado"}
              </span>
            }
          />
          <SettingRow
            label="Condições"
            control={
              <span className="text-caption text-foreground">
                {order.paymentTerms ?? "Não informadas"}
              </span>
            }
          />
          {order.notes ? (
            <SettingRow
              label="Observações"
              control={
                <p className="text-caption leading-relaxed text-foreground">
                  {order.notes}
                </p>
              }
            />
          ) : null}
          {order.cancelReason ? (
            <SettingRow
              label="Motivo do cancelamento"
              control={
                <p className="text-caption leading-relaxed text-destructive">
                  {order.cancelReason}
                </p>
              }
            />
          ) : null}
        </SettingGroup>
      </div>

      <ConfirmDialog
        open={canceling}
        onOpenChange={setCanceling}
        title={`Cancelar ${order.number}?`}
        description="A ordem é encerrada e o fornecedor precisa ser avisado por fora. Se já houve recebimento, a API recusa e orienta a registrar devolução."
        confirmLabel={cancel.isPending ? "Cancelando…" : "Cancelar ordem"}
        cancelLabel="Voltar"
        isPending={cancel.isPending}
        reason={{
          label: "Motivo",
          placeholder: "Por que esta ordem não vai adiante?",
          required: true,
          minLength: 10,
        }}
        onConfirm={(reason) =>
          cancel.mutate(reason ?? "", {
            onSuccess: () => toast.success(`${order.number} foi cancelada.`),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      />
    </div>
  )
}
