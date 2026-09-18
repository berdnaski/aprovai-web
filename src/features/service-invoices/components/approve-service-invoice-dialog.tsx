import { useState } from "react"
import { toast } from "sonner"

import type { ServiceInvoice } from "@/api/service-invoices"
import { getApiErrorMessage } from "@/api/client"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApproveServiceInvoice } from "@/hooks/service-invoices/use-service-invoices"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"
import { formatCents } from "@/lib/money"

export function ApproveServiceInvoiceDialog({
  serviceInvoice,
  open,
  onOpenChange,
}: {
  serviceInvoice: ServiceInvoice
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [dueDate, setDueDate] = useState("")
  const [supplierId, setSupplierId] = useState("")

  const suppliersQuery = useSuppliers({ perPage: 100 })
  const approve = useApproveServiceInvoice(serviceInvoice.id)

  const needsSupplier = !serviceInvoice.supplierId
  const suppliers = suppliersQuery.data?.items ?? []
  const pickedSupplier = suppliers.find((supplier) => supplier.id === supplierId)
  const canSubmit = dueDate.length > 0 && (!needsSupplier || supplierId.length > 0)

  function close(next: boolean) {
    if (!next) {
      setDueDate("")
      setSupplierId("")
    }
    onOpenChange(next)
  }

  function submit() {
    approve.mutate(
      {
        dueDate,
        ...(needsSupplier ? { supplierId } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Nota aprovada. Conta a pagar gerada pelo valor líquido.")
          close(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">Aprovar nota de serviço</DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            Gera uma conta a pagar de{" "}
            <span className="font-medium text-foreground">
              {formatCents(serviceInvoice.netAmountCents)}
            </span>{" "}
            (líquido, após as retenções desta nota). O rateio por centro de
            custo fica em branco — defina depois em Contas a Pagar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-5">
          {needsSupplier ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">Fornecedor</Label>
              <Select
                value={supplierId}
                onValueChange={(next) => setSupplierId((next as string) ?? "")}
              >
                <SelectTrigger
                  aria-label="Fornecedor"
                  className="h-9 w-full bg-card px-3"
                >
                  <SelectValue>
                    {() =>
                      pickedSupplier
                        ? (pickedSupplier.tradeName ?? pickedSupplier.legalName)
                        : "Escolha o fornecedor"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.tradeName ?? supplier.legalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="approve-due-date" className="text-label text-foreground">
              Vencimento
            </Label>
            <Input
              id="approve-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="h-9 w-full bg-card px-3"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="ghost" type="button" className="font-medium" />
            }
          >
            Cancelar
          </DialogClose>
          <Button
            disabled={!canSubmit || approve.isPending}
            onClick={submit}
            className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {approve.isPending ? "Aprovando…" : "Aprovar e gerar conta a pagar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
