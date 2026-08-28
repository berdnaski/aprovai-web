import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { PurchaseRequest } from "@/api/purchase-requests"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useCancelRequest } from "@/hooks/purchase-requests/use-purchase-requests"

export function CancelDialog({
  request,
  open,
  onOpenChange,
}: {
  request: PurchaseRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const cancel = useCancelRequest(request.id)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Cancelar ${request.number}?`}
      description="O pedido é encerrado e o valor comprometido volta para o orçamento. Não dá para desfazer."
      confirmLabel={cancel.isPending ? "Cancelando…" : "Cancelar pedido"}
      cancelLabel="Voltar"
      isPending={cancel.isPending}
      reason={{
        label: "Motivo",
        placeholder: "Por que este pedido não vai adiante?",
        required: true,
        minLength: 10,
      }}
      onConfirm={(reason) =>
        cancel.mutate(reason ?? "", {
          onSuccess: () => toast.success(`${request.number} foi cancelado.`),
          onError: (error) => toast.error(getApiErrorMessage(error)),
        })
      }
    />
  )
}
