import { ArrowLeft } from "@phosphor-icons/react"
import { Link, useParams } from "react-router-dom"

import { getApiErrorMessage } from "@/api/client"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusPill } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useMembers } from "@/hooks/members/use-members"
import { usePurchaseOrder } from "@/hooks/purchase-orders/use-purchase-orders"
import { useReceipt } from "@/hooks/receipts/use-receipts"
import { displayName } from "@/lib/people"
import { RECEIPT_STATUS } from "@/lib/status-labels"

function fullDate(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>()

  const receiptQuery = useReceipt(id)
  const receipt = receiptQuery.data
  const order = usePurchaseOrder(receipt?.purchaseOrderId)
  const { data: members = [] } = useMembers()

  if (receiptQuery.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    )
  }

  if (receiptQuery.isError || !receipt) {
    return <LoadError message={getApiErrorMessage(receiptQuery.error)} />
  }

  const receiver = members.find((member) => member.id === receipt.receivedById)
  const orderItems = order.data?.items ?? []

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        to={
          receipt.purchaseOrderId
            ? `/ordens-de-compra/${receipt.purchaseOrderId}`
            : "/ordens-de-compra"
        }
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={13} aria-hidden />
        {order.data?.number ?? "Ordem de compra"}
      </Link>

      <PageHeader
        title={receipt.number}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge map={RECEIPT_STATUS} value={receipt.status} />
            {receipt.hasDivergence ? (
              <StatusPill tone="warning">Com divergência</StatusPill>
            ) : null}
            <span className="text-subhead text-muted-foreground">
              {fullDate(receipt.receivedAt)}
            </span>
          </span>
        }
      />

      <SettingGroup title="Itens recebidos" count={receipt.items?.length ?? 0}>
        {(receipt.items ?? []).map((item) => {
          const source = orderItems.find(
            (entry) => entry.id === item.purchaseOrderItemId,
          )

          return (
            <SettingRow
              key={item.id}
              label={source?.description ?? "Item da ordem"}
              hint={item.rejectionReason ?? undefined}
              control={
                <div className="flex w-full flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-caption tabular-nums text-brand-accent-strong">
                    {item.quantity} {source?.unit ?? ""} recebido
                  </span>
                  {Number(item.rejectedQuantity) > 0 ? (
                    <span className="text-caption tabular-nums text-destructive">
                      {item.rejectedQuantity} recusado
                    </span>
                  ) : null}
                </div>
              }
            />
          )
        })}
      </SettingGroup>

      <SettingGroup title="Dados do recebimento">
        <SettingRow
          label="Quem recebeu"
          control={
            <span className="text-caption text-foreground">
              {receiver ? displayName(receiver) : "Não identificado"}
            </span>
          }
        />
        <SettingRow
          label="Data"
          control={
            <span className="text-caption text-foreground">
              {fullDate(receipt.receivedAt)}
            </span>
          }
        />
        {receipt.notes ? (
          <SettingRow
            label="Observações"
            control={
              <p className="text-caption leading-relaxed text-foreground">
                {receipt.notes}
              </p>
            }
          />
        ) : null}
      </SettingGroup>
    </div>
  )
}
