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
import { useUploadServiceInvoice } from "@/hooks/service-invoices/use-service-invoices"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"

const NO_SUPPLIER = "__sem_fornecedor__"

export function UploadServiceInvoiceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const [failure, setFailure] = useState<string | null>(null)
  const [picked, setPicked] = useState<string>(NO_SUPPLIER)

  const suppliersQuery = useSuppliers({ perPage: 100 })
  const upload = useUploadServiceInvoice()

  const suppliers = suppliersQuery.data?.items ?? []
  const pickedSupplier = suppliers.find((supplier) => supplier.id === picked)

  function close(next: boolean) {
    if (!next) {
      setFailure(null)
      setPicked(NO_SUPPLIER)
    }

    onOpenChange(next)
  }

  function send(file: File) {
    setFailure(null)

    upload.mutate(
      { file, supplierId: picked === NO_SUPPLIER ? undefined : picked },
      {
        onSuccess: (serviceInvoice) => {
          toast.success(`Nota ${serviceInvoice.number} recebida.`)
          close(false)
          navigate(`/notas-de-servico/${serviceInvoice.id}`)
        },
        onError: (error) => setFailure(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">Enviar nota de serviço</DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            XML da NFS-e no padrão nacional, não o PDF (DANFSE). Se souber o
            fornecedor, escolha abaixo — senão vincula na hora de aprovar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-label text-foreground">Fornecedor</Label>
            <Select
              value={picked}
              onValueChange={(next) => setPicked((next as string) ?? NO_SUPPLIER)}
            >
              <SelectTrigger
                aria-label="Fornecedor"
                className="h-9 w-full bg-card px-3"
              >
                <SelectValue>
                  {() =>
                    pickedSupplier
                      ? (pickedSupplier.tradeName ?? pickedSupplier.legalName)
                      : "Ainda não sei o fornecedor"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SUPPLIER}>
                  Ainda não sei o fornecedor
                </SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.tradeName ?? supplier.legalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FileDropzone
            onSelect={send}
            accept={[".xml"]}
            isUploading={upload.isPending}
            label="Arraste o XML ou clique"
            hint="Apenas o arquivo XML da NFS-e, não o PDF (DANFSE)"
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
