import { ArrowLeft, Info, ShoppingCart } from "@phosphor-icons/react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { LoadError } from "@/components/shared/load-error"
import { MoneyDisplay } from "@/components/shared/money-display"
import { PageHeader } from "@/components/shared/page-header"
import { SettingGroup, SettingRow } from "@/components/shared/setting-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyCompany } from "@/hooks/companies/use-companies"
import { useIssuePurchaseOrder } from "@/hooks/purchase-orders/use-purchase-orders"
import {
  usePurchaseRequest,
  useRequestItems,
} from "@/hooks/purchase-requests/use-purchase-requests"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { RequestStatus } from "@/types/enums"

export function IssueOrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [expectedDeliveryAt, setExpectedDeliveryAt] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [paymentTerms, setPaymentTerms] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [prefix, setPrefix] = useState<string | null>(null)

  const requestQuery = usePurchaseRequest(id)
  const { data: items = [] } = useRequestItems(id)
  const suppliersQuery = useSuppliers({ perPage: 100 })
  const { data: company } = useMyCompany()
  const issue = useIssuePurchaseOrder(id ?? "")

  const request = requestQuery.data

  if (requestQuery.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (requestQuery.isError || !request) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <LoadError message={getApiErrorMessage(requestQuery.error)} />
      </div>
    )
  }

  if (request.status !== RequestStatus.APPROVED) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <LoadError
          title="Este pedido ainda não está aprovado"
          message="A ordem de compra só é emitida depois que o pedido passa por toda a rota de aprovação."
          onRetry={() => navigate(`/pedidos/${request.id}`)}
        />
      </div>
    )
  }

  const supplier = (suppliersQuery.data?.items ?? []).find(
    (item) => item.id === request.supplierId,
  )
  const terms = paymentTerms ?? request.paymentTerms ?? ""
  const numberPrefix = prefix ?? company?.poNumberPrefix ?? "PO"

  function submit() {
    issue.mutate(
      {
        ...(expectedDeliveryAt
          ? { expectedDeliveryAt: new Date(expectedDeliveryAt).toISOString() }
          : {}),
        ...(deliveryAddress.trim()
          ? { deliveryAddress: deliveryAddress.trim() }
          : {}),
        ...(terms.trim() ? { paymentTerms: terms.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(numberPrefix.trim()
          ? { numberPrefix: numberPrefix.trim().toUpperCase() }
          : {}),
      },
      {
        onSuccess: (order) => {
          toast.success(`Ordem ${order.number} emitida.`)
          navigate(`/ordens-de-compra/${order.id}`)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        to={`/pedidos/${request.id}`}
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={13} aria-hidden />
        {request.number}
      </Link>

      <PageHeader
        title="Emitir ordem de compra"
        description="Os itens são copiados do pedido agora. Alterar o pedido depois não muda a ordem emitida."
      />

      <SettingGroup title="O que será comprado" count={items.length}>
        <SettingRow
          label="Fornecedor"
          control={
            <span className="text-caption text-foreground">
              {supplier
                ? (supplier.tradeName ?? supplier.legalName)
                : "Não informado"}
            </span>
          }
        />
        <SettingRow
          label="Pedido"
          control={
            <span className="text-caption text-foreground">
              {request.title}
            </span>
          }
        />
        <SettingRow
          label="Total"
          control={
            <MoneyDisplay
              cents={request.totalAmountCents}
              emphasis
              className="text-body"
            />
          }
        />
      </SettingGroup>

      <SettingGroup
        title="Dados da ordem"
        description="Tudo opcional. O que ficar em branco não aparece na ordem."
        footer={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <p className="flex items-center gap-2 text-caption text-muted-foreground">
              <Info size={13} aria-hidden />
              Fica {numberPrefix.toUpperCase()}-{new Date().getFullYear()}-0001,
              seguindo a sequência do ano
            </p>

            <Button
              size="lg"
              disabled={issue.isPending}
              onClick={submit}
              className="ml-auto gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <ShoppingCart size={15} aria-hidden />
              {issue.isPending ? "Emitindo…" : "Emitir ordem"}
            </Button>
          </div>
        }
      >
        <SettingRow
          label="Entrega esperada"
          description="Opcional"
          control={
            <Input
              type="date"
              value={expectedDeliveryAt}
              onChange={(event) => setExpectedDeliveryAt(event.target.value)}
              aria-label="Data de entrega esperada"
              className="h-9 w-48 text-body md:text-body"
            />
          }
        />

        <SettingRow
          label="Endereço de entrega"
          description="Opcional"
          control={
            <Input
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="Onde o fornecedor deve entregar"
              aria-label="Endereço de entrega"
              className="h-9 max-w-md text-body md:text-body"
            />
          }
        />

        <SettingRow
          label="Condições"
          description="Vem do pedido"
          control={
            <Input
              value={terms}
              onChange={(event) => setPaymentTerms(event.target.value)}
              placeholder="30 dias após a entrega"
              aria-label="Condições de pagamento"
              className="h-9 max-w-md text-body md:text-body"
            />
          }
        />

        <SettingRow
          label="Prefixo do número"
          description="Da política da empresa"
          control={
            <Input
              value={numberPrefix}
              onChange={(event) => setPrefix(event.target.value)}
              aria-label="Prefixo da numeração"
              maxLength={8}
              className="h-9 w-28 text-body uppercase md:text-body"
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
              aria-label="Observações"
              placeholder="Instruções para o fornecedor."
              className="w-full max-w-md resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          }
        />
      </SettingGroup>
    </div>
  )
}
