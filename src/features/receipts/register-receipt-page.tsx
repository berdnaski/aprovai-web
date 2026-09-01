import { ArrowLeft, Truck, WarningCircle } from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { ItemBalance } from "@/api/purchase-orders"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useOrderBalance,
  usePurchaseOrder,
} from "@/hooks/purchase-orders/use-purchase-orders"
import { useRegisterReceipt } from "@/hooks/receipts/use-receipts"
import { cn } from "@/lib/utils"
import { PurchaseOrderStatus } from "@/types/enums"

interface Line {
  received: string
  rejected: string
  reason: string
}

function num(value: string): number {
  const parsed = Number(value.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : 0
}

function trim(value: string): string {
  const parsed = num(value)
  return parsed % 1 === 0 ? String(parsed) : String(parsed).replace(".", ",")
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function ItemRow({
  item,
  line,
  onChange,
}: {
  item: ItemBalance
  line: Line
  onChange: (patch: Partial<Line>) => void
}) {
  const pending = num(item.pendingQuantity)
  const received = num(line.received)
  const rejected = num(line.rejected)

  const excess = received + rejected > pending
  const needsReason = rejected > 0 && line.reason.trim().length === 0

  return (
    <div className="flex flex-col gap-2 px-5 py-3.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-caption font-medium text-foreground">
            {item.description}
          </p>
          <p className="text-micro tabular-nums text-muted-foreground/70">
            {trim(item.pendingQuantity)} {item.unit} pendente de{" "}
            {trim(item.orderedQuantity)}
          </p>
        </div>

        <label className="flex shrink-0 items-center gap-2">
          <span className="w-16 text-caption text-muted-foreground sm:w-auto">
            Recebido
          </span>
          <Input
            value={line.received}
            onChange={(event) => onChange({ received: event.target.value })}
            inputMode="decimal"
            aria-label={`Quantidade recebida de ${item.description}`}
            aria-invalid={excess || undefined}
            className={cn(
              "h-8 w-24 text-caption tabular-nums md:text-caption",
              excess && "border-destructive/50",
            )}
          />
        </label>

        <label className="flex shrink-0 items-center gap-2">
          <span className="w-16 text-caption text-muted-foreground sm:w-auto">
            Recusado
          </span>
          <Input
            value={line.rejected}
            onChange={(event) => onChange({ rejected: event.target.value })}
            inputMode="decimal"
            aria-label={`Quantidade recusada de ${item.description}`}
            className="h-8 w-24 text-caption tabular-nums md:text-caption"
          />
        </label>
      </div>

      {rejected > 0 ? (
        <Input
          value={line.reason}
          onChange={(event) => onChange({ reason: event.target.value })}
          placeholder="Por que esta quantidade foi recusada?"
          aria-label={`Motivo da recusa de ${item.description}`}
          aria-invalid={needsReason || undefined}
          className={cn(
            "h-8 text-caption md:text-caption",
            needsReason && "border-destructive/50",
          )}
        />
      ) : null}

      {excess ? (
        <p className="text-caption text-destructive">
          A soma passa das {trim(item.pendingQuantity)} {item.unit} pendentes.
        </p>
      ) : null}
    </div>
  )
}

export function RegisterReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [lines, setLines] = useState<Record<string, Line> | null>(null)
  const [receivedAt, setReceivedAt] = useState(today())
  const [notes, setNotes] = useState("")

  const orderQuery = usePurchaseOrder(id)
  const balanceQuery = useOrderBalance(id)
  const register = useRegisterReceipt(id ?? "")

  const balance = balanceQuery.data ?? []
  const pendingItems = balance.filter((item) => num(item.pendingQuantity) > 0)

  if (lines === null && balanceQuery.data) {
    setLines(
      Object.fromEntries(
        pendingItems.map((item) => [
          item.itemId,
          { received: trim(item.pendingQuantity), rejected: "", reason: "" },
        ]),
      ),
    )
  }

  if (orderQuery.isPending || balanceQuery.isPending || lines === null) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    )
  }

  if (orderQuery.isError || !orderQuery.data) {
    return <LoadError message={getApiErrorMessage(orderQuery.error)} />
  }

  const order = orderQuery.data

  if (order.status === PurchaseOrderStatus.CANCELED) {
    return (
      <LoadError
        title="Esta ordem foi cancelada"
        message="Não é possível registrar recebimento de uma ordem cancelada."
        onRetry={() => navigate(`/ordens-de-compra/${order.id}`)}
      />
    )
  }

  if (pendingItems.length === 0) {
    return (
      <LoadError
        title="Nada pendente nesta ordem"
        message="Todos os itens já foram recebidos."
        onRetry={() => navigate(`/ordens-de-compra/${order.id}`)}
      />
    )
  }

  const filled = pendingItems.map((item) => ({
    item,
    line: lines[item.itemId] ?? { received: "", rejected: "", reason: "" },
  }))

  const anyExcess = filled.some(
    ({ item, line }) =>
      num(line.received) + num(line.rejected) > num(item.pendingQuantity),
  )
  const missingReason = filled.some(
    ({ line }) => num(line.rejected) > 0 && line.reason.trim().length === 0,
  )
  const nothing = filled.every(
    ({ line }) => num(line.received) <= 0 && num(line.rejected) <= 0,
  )

  const blocked = anyExcess || missingReason || nothing

  function submit() {
    if (blocked) {
      return
    }

    register.mutate(
      {
        items: filled
          .filter(
            ({ line }) => num(line.received) > 0 || num(line.rejected) > 0,
          )
          .map(({ item, line }) => ({
            purchaseOrderItemId: item.itemId,
            quantity: String(num(line.received)),
            ...(num(line.rejected) > 0
              ? {
                  rejectedQuantity: String(num(line.rejected)),
                  rejectionReason: line.reason.trim(),
                }
              : {}),
          })),
        ...(receivedAt
          ? { receivedAt: new Date(`${receivedAt}T12:00:00`).toISOString() }
          : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      },
      {
        onSuccess: (receipt) => {
          toast.success(`Recebimento ${receipt.number} registrado.`)
          navigate(`/recebimentos/${receipt.id}`)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        to={`/ordens-de-compra/${order.id}`}
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={13} aria-hidden />
        {order.number}
      </Link>

      <PageHeader
        title="Registrar recebimento"
        description="Já vem preenchido com tudo que está pendente. Ajuste o que chegou diferente."
      />

      <SettingGroup
        title="O que chegou"
        count={pendingItems.length}
        footer={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {blocked ? (
              <p className="flex items-center gap-1.5 text-caption text-warning-strong">
                <WarningCircle size={13} weight="fill" aria-hidden />
                {nothing
                  ? "Informe ao menos uma quantidade"
                  : anyExcess
                    ? "Alguma quantidade passa do pendente"
                    : "Explique cada recusa"}
              </p>
            ) : (
              <p className="text-caption text-muted-foreground">
                O saldo da ordem é atualizado na hora.
              </p>
            )}

            <Button
              size="lg"
              disabled={blocked || register.isPending}
              onClick={submit}
              className="ml-auto gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <Truck size={15} aria-hidden />
              {register.isPending ? "Registrando…" : "Registrar recebimento"}
            </Button>
          </div>
        }
      >
        <div className="divide-y divide-border/50">
          {filled.map(({ item, line }) => (
            <ItemRow
              key={item.itemId}
              item={item}
              line={line}
              onChange={(patch) =>
                setLines({ ...lines, [item.itemId]: { ...line, ...patch } })
              }
            />
          ))}
        </div>
      </SettingGroup>

      <SettingGroup title="Dados do recebimento">
        <SettingRow
          label="Data"
          control={
            <Input
              type="date"
              value={receivedAt}
              max={today()}
              onChange={(event) => setReceivedAt(event.target.value)}
              aria-label="Data do recebimento"
              className="h-9 w-48 text-body md:text-body"
            />
          }
        />
        <SettingRow
          label="Observações"
          description="Opcional"
          control={
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              aria-label="Observações do recebimento"
              placeholder="Estado da entrega, quem recebeu, avarias."
              className="w-full max-w-md resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          }
        />
      </SettingGroup>
    </div>
  )
}
