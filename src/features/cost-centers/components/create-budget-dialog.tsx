import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MonthPicker } from "@/components/ui/month-picker"
import {
  useCostCenterBudgets,
  useCreateBudget,
} from "@/hooks/budgets/use-budgets"
import { toCents } from "@/lib/money"
import {
  BUDGET_PERIOD_TYPE_HINTS,
  BUDGET_PERIOD_TYPE_LABELS,
  BudgetPeriodType,
} from "@/types/enums"
import { cn } from "@/lib/utils"

import { currentPeriodValue, labelForPeriodValue } from "../period"

const PERIOD_TYPES: BudgetPeriodType[] = [
  BudgetPeriodType.MONTHLY,
  BudgetPeriodType.QUARTERLY,
  BudgetPeriodType.ANNUAL,
]

export function CreateBudgetDialog({
  costCenterId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  costCenterId: string
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [periodType, setPeriodType] = useState<BudgetPeriodType>(BudgetPeriodType.MONTHLY)
  const [period, setPeriod] = useState(currentPeriodValue())
  const [amount, setAmount] = useState("")

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const { data: budgets = [] } = useCostCenterBudgets(costCenterId)
  const create = useCreateBudget(costCenterId)

  const taken = budgets.map((budget) => budget.periodStart.slice(0, 7))

  function setOpen(next: boolean) {
    if (!isControlled) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next)

    if (!next) {
      setPeriodType(BudgetPeriodType.MONTHLY)
      setPeriod(currentPeriodValue())
      setAmount("")
    }
  }

  function changeType(next: BudgetPeriodType) {
    setPeriodType(next)

    const [year] = period.split("-").map(Number)

    if (next === BudgetPeriodType.ANNUAL) {
      setPeriod(`${year}-01`)
    } else if (next === BudgetPeriodType.QUARTERLY) {
      const month = Number(period.split("-")[1]) - 1
      const start = Math.floor(month / 3) * 3
      setPeriod(`${year}-${String(start + 1).padStart(2, "0")}`)
    }
  }

  const cents = toCents(amount)
  const valid = Number(cents) > 0 && !taken.includes(period)

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!valid) {
      return
    }

    create.mutate(
      { period, periodType, totalAmountCents: cents },
      {
        onSuccess: () => {
          toast.success(`Orçamento de ${labelForPeriodValue(period)} definido.`)
          setOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger render={trigger} /> : null}

      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Definir orçamento do período
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Cada período é um registro novo. O que sobrar não passa para o
              próximo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="flex flex-col gap-2">
              <span className="text-label text-foreground">Duração</span>
              <div className="flex gap-1.5">
                {PERIOD_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => changeType(type)}
                    aria-pressed={periodType === type}
                    className={cn(
                      "flex-1 rounded-md border px-2 py-1.5 text-label font-normal transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      periodType === type
                        ? "border-primary/30 bg-primary/6 font-medium text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {BUDGET_PERIOD_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
              <p className="text-caption text-muted-foreground">
                {BUDGET_PERIOD_TYPE_HINTS[periodType]}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-label text-foreground">
                Início do período
              </span>
              <MonthPicker
                value={period}
                onChange={setPeriod}
                periodType={periodType}
                takenPeriods={taken}
              />
              <p className="text-caption text-muted-foreground">
                {labelForPeriodValue(period)}
                {taken.includes(period)
                  ? " já tem orçamento — escolha outro mês."
                  : ""}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="budget-total"
                className="text-label text-foreground"
              >
                Teto do período
              </Label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-body text-muted-foreground">
                  R$
                </span>
                <Input
                  id="budget-total"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                  autoComplete="off"
                  className="h-11 pl-10 text-heading tabular-nums md:text-heading"
                />
              </div>
              {Number(cents) > 0 ? (
                <p className="text-caption text-muted-foreground">
                  <MoneyDisplay cents={cents} /> disponíveis para pedidos deste
                  período.
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  type="button"
                  className="font-medium"
                />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={!valid || create.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {create.isPending ? "Salvando…" : "Definir orçamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
