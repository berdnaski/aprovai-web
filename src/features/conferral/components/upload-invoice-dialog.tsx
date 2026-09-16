import { WarningCircle } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUploadInvoice } from "@/hooks/invoices/use-invoices"
import { usePurchaseOrders } from "@/hooks/purchase-orders/use-purchase-orders"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { formatCents } from "@/lib/money"
import { PurchaseOrderStatus } from "@/types/enums"

const NO_ORDER = "__sem_ordem__"

const CLOSED: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.CANCELED,
  PurchaseOrderStatus.CLOSED,
]

export function UploadInvoiceDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
}: {
  orderId?: string
  orderNumber?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const [failure, setFailure] = useState<string | null>(null)
  const [picked, setPicked] = useState<string>(NO_ORDER)

  const ordersQuery = usePurchaseOrders({ perPage: 100 })
  const suppliersQuery = useSuppliers({ perPage: 100 })

  const targetOrderId = orderId ?? (picked === NO_ORDER ? undefined : picked)
  const upload = useUploadInvoice(targetOrderId)

  const supplierName = new Map(
    (suppliersQuery.data?.items ?? []).map((supplier) => [
      supplier.id,
      supplier.tradeName ?? supplier.legalName,
    ]),
  )

  const openOrders = (ordersQuery.data?.items ?? []).filter(
    (order) => !CLOSED.includes(order.status),
  )
  const pickedOrder = openOrders.find((order) => order.id === picked)

  function close(next: boolean) {
    if (!next) {
      setFailure(null)
      setPicked(NO_ORDER)
    }

    onOpenChange(next)
  }

  function send(file: File) {
    setFailure(null)

    upload.mutate(file, {
      onSuccess: (invoice) => {
        toast.success(`Nota ${invoice.number} recebida.`)
        close(false)
        navigate(`/conferencia/notas/${invoice.id}`)
      },
      onError: (error) => setFailure(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">Enviar nota fiscal</DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            {orderNumber
              ? `O XML entra ligado à ordem ${orderNumber}, com cada item casado ao item pedido.`
              : "Escolha a ordem para a nota já entrar ligada aos itens pedidos. Se ainda não souber, envie sem ordem e vincule depois."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-5">
          {orderId ? null : (
            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">
                Ordem de compra
              </Label>
              <Select
                value={picked}
                onValueChange={(next) => setPicked((next as string) ?? NO_ORDER)}
              >
                <SelectTrigger
                  aria-label="Ordem de compra"
                  className="h-9 w-full bg-card px-3"
                >
                  <SelectValue>
                    {() =>
                      pickedOrder
                        ? `${pickedOrder.number} · ${supplierName.get(pickedOrder.supplierId) ?? "Fornecedor"}`
                        : "Ainda não sei a ordem"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_ORDER}>Ainda não sei a ordem</SelectItem>
                  {openOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      <span className="flex w-full items-baseline justify-between gap-4">
                        <span className="truncate">
                          {order.number} ·{" "}
                          {supplierName.get(order.supplierId) ?? "Fornecedor"}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {formatCents(order.totalAmountCents)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <FileDropzone
            onSelect={send}
            accept={[".xml"]}
            isUploading={upload.isPending}
            label="Arraste o XML ou clique"
            hint="Apenas o arquivo XML da NF-e, não o PDF (DANFE)"
          />

          {failure ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-caption leading-relaxed text-foreground"
            >
              <WarningCircle
                size={15}
                aria-hidden
                className="mt-px shrink-0 text-destructive"
              />
              {failure}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="ghost" type="button" className="font-medium" />
            }
          >
            Fechar
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
