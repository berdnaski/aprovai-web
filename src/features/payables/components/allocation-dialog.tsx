import { useEffect, useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Payable } from "@/api/payables"
import {
  AllocationEditor,
  allocationIsValid,
  toAllocationPayload,
  type AllocationRow,
} from "@/components/shared/allocation-editor"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useChartAccounts } from "@/hooks/chart-accounts/use-chart-accounts"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import {
  usePayableAllocations,
  useReplacePayableAllocations,
} from "@/hooks/payables/use-payables"

function rowsFromLines(
  lines: { costCenterId: string; chartAccountId: string | null; amountCents: string }[],
  totalCents: string,
): AllocationRow[] {
  const total = BigInt(totalCents || "0")

  return lines.map((line) => ({
    costCenterId: line.costCenterId,
    chartAccountId: line.chartAccountId,
    percent:
      total > 0n
        ? ((Number(BigInt(line.amountCents) * 10000n / total) / 100)).toString()
        : "0",
  }))
}

export function PayableAllocationDialog({
  payable,
  open,
  onOpenChange,
}: {
  payable: Payable | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [rows, setRows] = useState<AllocationRow[] | null>(null)

  const allocationsQuery = usePayableAllocations(payable?.id)
  const costCentersQuery = useCostCenters()
  const accountsQuery = useChartAccounts()
  const replace = useReplacePayableAllocations(payable?.id ?? "")

  const costCenters = (costCentersQuery.data ?? [])
    .filter((item) => !item.disabledAt)
    .map((item) => ({ id: item.id, label: item.name }))
  const accounts = (accountsQuery.data ?? [])
    .filter((item) => item.postable)
    .map((item) => ({ id: item.id, label: `${item.code} · ${item.name}` }))

  const baseRows = payable
    ? rowsFromLines(allocationsQuery.data ?? [], payable.amountCents)
    : []
  const effectiveRows = rows ?? baseRows
  const valid = allocationIsValid(effectiveRows)

  useEffect(() => {
    setRows(null)
  }, [payable?.id])

  function close(next: boolean) {
    if (!next) {
      setRows(null)
    }
    onOpenChange(next)
  }

  if (!payable) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading">
            Rateio da conta a pagar
          </DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            Percentuais sobre o valor da conta, por centro de custo e conta
            contábil.
          </DialogDescription>
        </DialogHeader>

        <div className="py-5">
          {allocationsQuery.isPending ? (
            <Skeleton className="h-32 w-full rounded-lg" />
          ) : (
            <AllocationEditor
              rows={effectiveRows}
              onChange={setRows}
              costCenters={costCenters}
              accounts={accounts}
              totalCents={payable.amountCents}
              disabled={replace.isPending}
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" type="button" className="font-medium" />}
          >
            Fechar
          </DialogClose>
          <Button
            type="button"
            disabled={!valid || !rows || replace.isPending}
            onClick={() => {
              if (!rows) return

              replace.mutate(toAllocationPayload(rows), {
                onSuccess: () => {
                  toast.success("Rateio atualizado.")
                  close(false)
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
              })
            }}
            className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {replace.isPending ? "Salvando…" : "Salvar rateio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
