import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { PurchaseRequest } from "@/api/purchase-requests"
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
import { MoneyInput } from "@/components/ui/money-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useChartAccounts } from "@/hooks/chart-accounts/use-chart-accounts"
import { useCostCenters } from "@/hooks/onboarding/use-onboarding"
import { useCreateRecurringContract } from "@/hooks/recurring-contracts/use-recurring-contracts"
import { RECURRING_FREQUENCY_LABELS, RecurringFrequency } from "@/types/enums"

const FREQUENCIES: RecurringFrequency[] = [
  RecurringFrequency.MONTHLY,
  RecurringFrequency.QUARTERLY,
  RecurringFrequency.ANNUAL,
]

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function CreateRecurringContractDialog({
  request,
  open,
  onOpenChange,
}: {
  request: PurchaseRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()

  const [frequency, setFrequency] = useState<RecurringFrequency>(
    RecurringFrequency.MONTHLY,
  )
  const [amountCents, setAmountCents] = useState(request.totalAmountCents)
  const [startDate, setStartDate] = useState(todayIso())
  const [costCenterId, setCostCenterId] = useState(request.costCenterId)
  const [chartAccountId, setChartAccountId] = useState<string | null>(null)

  const costCentersQuery = useCostCenters()
  const accountsQuery = useChartAccounts()
  const create = useCreateRecurringContract(request.id)

  const costCenters = (costCentersQuery.data ?? []).filter(
    (item) => !item.disabledAt,
  )
  const accounts = (accountsQuery.data ?? []).filter((item) => item.postable)

  const valid = Number(amountCents || "0") > 0 && Boolean(startDate)

  function close(next: boolean) {
    if (!next) {
      setFrequency(RecurringFrequency.MONTHLY)
      setAmountCents(request.totalAmountCents)
      setStartDate(todayIso())
      setCostCenterId(request.costCenterId)
      setChartAccountId(null)
    }
    onOpenChange(next)
  }

  function submit() {
    if (!valid) {
      return
    }

    create.mutate(
      {
        frequency,
        amountCents,
        startDate: new Date(`${startDate}T12:00:00`).toISOString(),
        costCenterId,
        chartAccountId: chartAccountId ?? undefined,
      },
      {
        onSuccess: (contract) => {
          toast.success("Assinatura recorrente criada.")
          close(false)
          navigate(`/assinaturas-recorrentes/${contract.id}`)
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
            Transformar em assinatura recorrente
          </DialogTitle>
          <DialogDescription className="text-caption leading-relaxed">
            A partir de agora, essa compra volta a consumir o orçamento
            sozinha a cada ciclo, sem precisar de uma nova aprovação. Você só
            liga a nota que chegar a cada cobrança.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">Frequência</Label>
              <Select
                value={frequency}
                onValueChange={(next) => setFrequency(next as RecurringFrequency)}
              >
                <SelectTrigger className="h-9 w-full bg-card px-3">
                  <SelectValue>
                    {(value: RecurringFrequency) => RECURRING_FREQUENCY_LABELS[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {RECURRING_FREQUENCY_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contract-start" className="text-label text-foreground">
                Início do 1º ciclo
              </Label>
              <Input
                id="contract-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-9 text-body md:text-body"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-label text-foreground">Valor por ciclo</Label>
            <MoneyInput
              value={amountCents}
              onChange={setAmountCents}
              ariaLabel="Valor por ciclo"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-label text-foreground">Centro de custo</Label>
            <Select
              value={costCenterId}
              onValueChange={(next) => setCostCenterId(next as string)}
            >
              <SelectTrigger className="h-9 w-full bg-card px-3">
                <SelectValue>
                  {(value: string) =>
                    costCenters.find((item) => item.id === value)?.name ??
                    "Escolher"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {costCenters.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {accounts.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">
                Conta contábil
                <span className="ml-1.5 font-normal text-muted-foreground">
                  opcional
                </span>
              </Label>
              <Select
                value={chartAccountId}
                onValueChange={(next) =>
                  setChartAccountId((next ?? null) as string | null)
                }
              >
                <SelectTrigger className="h-9 w-full bg-card px-3">
                  <SelectValue>
                    {(value: string | null) => {
                      const found = accounts.find((item) => item.id === value)
                      return found ? `${found.code} · ${found.name}` : "Sem conta"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Sem conta</SelectItem>
                  {accounts.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} · {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" type="button" />}>
            Cancelar
          </DialogClose>
          <Button
            type="button"
            disabled={!valid || create.isPending}
            onClick={submit}
            className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {create.isPending ? "Criando…" : "Criar assinatura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
