import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import {
  AllocationEditor,
  allocationIsValid,
  toAllocationPayload,
  type AllocationRow,
} from "@/components/shared/allocation-editor"
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
import { MoneyInput } from "@/components/ui/money-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useChartAccounts } from "@/hooks/chart-accounts/use-chart-accounts"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import { useReleaseWithoutInvoice } from "@/hooks/payables/use-payables"
import { useSuppliers } from "@/hooks/suppliers/use-suppliers"

const MIN_NOTE = 10

export function ReleaseDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [amountCents, setAmountCents] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [note, setNote] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [allocate, setAllocate] = useState(false)
  const [rows, setRows] = useState<AllocationRow[]>([])

  const suppliersQuery = useSuppliers({ perPage: 100 })
  const suppliers = suppliersQuery.data?.items ?? []
  const release = useReleaseWithoutInvoice()
  const costCentersQuery = useCostCenters()
  const accountsQuery = useChartAccounts()

  const costCenters = (costCentersQuery.data ?? [])
    .filter((item) => !item.disabledAt)
    .map((item) => ({ id: item.id, label: item.name }))
  const accounts = (accountsQuery.data ?? [])
    .filter((item) => item.postable)
    .map((item) => ({ id: item.id, label: `${item.code} · ${item.name}` }))
  const hasChart = accounts.length > 0

  const ready =
    Boolean(supplierId) &&
    Number(amountCents || "0") > 0 &&
    Boolean(dueDate) &&
    note.trim().length >= MIN_NOTE &&
    file !== null &&
    (!allocate || allocationIsValid(rows))

  function close(next: boolean) {
    if (!next) {
      setSupplierId(null)
      setAmountCents("")
      setDueDate("")
      setNote("")
      setFile(null)
      setAllocate(false)
      setRows([])
    }

    onOpenChange(next)
  }

  function submit() {
    if (!ready || !supplierId || !file) {
      return
    }

    release.mutate(
      {
        supplierId,
        amountCents,
        dueDate: new Date(`${dueDate}T12:00:00`).toISOString(),
        note: note.trim(),
        file,
        ...(allocate && rows.length > 0
          ? { allocations: toAllocationPayload(rows) }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success("Pagamento liberado.")
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
          <DialogTitle className="text-heading">
            Liberar pagamento sem nota fiscal
          </DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            Para assinaturas de software, serviços do exterior ou qualquer
            compra que não gera nota fiscal brasileira conferível.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-label text-foreground">Fornecedor</Label>
            <Select
              value={supplierId}
              onValueChange={(next) =>
                setSupplierId((next ?? null) as string | null)
              }
            >
              <SelectTrigger
                className="h-9 w-full bg-card px-3"
                aria-label="Fornecedor"
              >
                <SelectValue>
                  {(value: string | null) => {
                    const supplier = value
                      ? suppliers.find((item) => item.id === value)
                      : undefined

                    return supplier
                      ? (supplier.tradeName ?? supplier.legalName)
                      : "Escolher"
                  }}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor" className="text-label text-foreground">
                Valor
              </Label>
              <MoneyInput
                id="valor"
                value={amountCents}
                onChange={setAmountCents}
                ariaLabel="Valor a pagar"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="vencimento"
                className="text-label text-foreground"
              >
                Vencimento
              </Label>
              <Input
                id="vencimento"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-9 text-body md:text-body"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivo" className="text-label text-foreground">
              Justificativa
            </Label>
            <textarea
              id="motivo"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="O que está sendo pago e por que não há nota fiscal."
              className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
            {note.trim().length < MIN_NOTE ? (
              <p className="text-caption text-muted-foreground">
                Mínimo de {MIN_NOTE} caracteres.
              </p>
            ) : null}
          </div>

          {hasChart ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-caption font-medium text-foreground">
                    Ratear entre centros de custo
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Opcional. Sem rateio, a conta fica sem centro de custo definido.
                  </p>
                </div>
                <Switch
                  checked={allocate}
                  onCheckedChange={(next) => {
                    setAllocate(next)
                    if (next && rows.length === 0) {
                      setRows([
                        {
                          costCenterId: costCenters[0]?.id ?? "",
                          chartAccountId: null,
                          percent: "100",
                        },
                      ])
                    }
                  }}
                />
              </div>

              {allocate ? (
                <AllocationEditor
                  rows={rows}
                  onChange={setRows}
                  costCenters={costCenters}
                  accounts={accounts}
                  totalCents={amountCents || "0"}
                />
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label className="text-label text-foreground">Comprovante</Label>
            {file ? (
              <p className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-caption text-foreground">
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="shrink-0 text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  trocar
                </button>
              </p>
            ) : (
              <FileDropzone
                onSelect={setFile}
                label="Anexar comprovante"
                hint="Contrato, fatura do exterior, recibo"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" type="button" className="font-medium" />
            }
          >
            Cancelar
          </DialogClose>
          <Button
            type="button"
            disabled={!ready || release.isPending}
            onClick={submit}
            className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {release.isPending ? "Liberando…" : "Liberar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
