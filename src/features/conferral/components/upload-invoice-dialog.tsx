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
import { useUploadInvoice } from "@/hooks/invoices/use-invoices"

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

  const upload = useUploadInvoice(orderId)

  function close(next: boolean) {
    if (!next) {
      setFailure(null)
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
              ? `O XML entra já vinculado à ordem ${orderNumber}.`
              : "Sem ordem escolhida, a nota entra sem vínculo e você liga depois."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-5">
          <FileDropzone
            onSelect={send}
            accept={[".xml"]}
            isUploading={upload.isPending}
            label="Arraste o XML ou clique"
            hint="Apenas o arquivo XML da NF-e"
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
              <Button variant="outline" type="button" className="font-medium" />
            }
          >
            Fechar
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
