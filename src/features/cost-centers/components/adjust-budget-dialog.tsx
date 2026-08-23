import { ArrowRight, Warning } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import type { Budget } from "@/api/budgets"
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
import { useUpdateBudget } from "@/hooks/budgets/use-budgets"
import { formatCents, toCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { formatPeriodLabel } from "../period"

const STEPS = [5, 10, 20]

export function AdjustBudgetDialog({
  budget,
  committedCents,
  underReviewCents,
  trigger,
}: {
  budget: Budget
  committedCents: string
  underReviewCents: string
  trigger: React.ReactElement
}) {
  const currentTotal = BigInt(budget.totalAmountCents)
  const committed = BigInt(committedCents)
  const underReview = BigInt(underReviewCents)

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(() => formatCents(budget.totalAmountCents))
  const [reason, setReason] = useState("")

  const update = useUpdateBudget(budget.id)
  const label = formatPeriodLabel(budget)

  useEffect(() => {
    if (open) {
      setAmount(formatCents(budget.totalAmountCents))
      setReason("")
    }
  }, [open, budget.totalAmountCents])

  const rawCents = toCents(amount)
  const valid = /^d+$/.test(rawCents)
  const nextTotal = valid ? BigInt(rawCents) : currentTotal
  const changed = valid && nextTotal !== currentTotal
  const delta = nextTotal - currentTotal

  const belowCommitted = valid && nextTotal < committed
  const rest = nextTotal - committed - underReview
  const nextAvailable = rest > 0n ? rest : 0n

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!changed) {
      return
    }

    update.mutate(
      {
        totalAmountCents: String(nextTotal),
        changeReason: reason.trim() ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            `Teto de ${label} ajustado para ${formatCents(String(nextTotal))}.`,
          )
          setOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />

      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Ajustar teto de {label}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              O teto vale só para este período — o saldo não passa para o mês
              seguinte. Pedidos já aprovados continuam valendo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="budget-amount"
                className="text-label text-foreground"
              >
                Novo teto
              </Label>

              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-body text-muted-foreground">
                  R$
                </span>
                <Input
                  id="budget-amount"
                  value={amount.replace(/^R\$\s?/, "")}
                  onChange={(event) => setAmount(event.target.value)}
                  onFocus={(event) => event.target.select()}
                  inputMode="decimal"
                  autoComplete="off"
                  className="h-11 pl-10 text-heading tabular-nums md:text-heading"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption text-muted-foreground">
                  reforçar em
                </span>
                {STEPS.map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() =>
                      setAmount(
                        formatCents(
                          (
                            (currentTotal * BigInt(100 + step)) /
                            100n
                          ).toString(),
                        ),
                      )
                    }
                    className="rounded-md border border-border px-2 py-0.5 text-caption font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    +{step}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(formatCents(budget.totalAmountCents))}
                  className="ml-auto text-caption text-muted-foreground underline decoration-border underline-offset-3 transition-colors hover:text-foreground"
                >
                  voltar ao atual
                </button>
              </div>
            </div>

            <section
              aria-label="Impacto do ajuste"
              className="rounded-lg border border-border bg-muted/40 px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-caption text-muted-foreground">teto</p>
                  <p className="text-body text-muted-foreground line-through tabular-nums">
                    <MoneyDisplay cents={budget.totalAmountCents} />
                  </p>
                </div>

                <ArrowRight
                  size={14}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden
                />

                <div className="min-w-0 text-right">
                  <p className="text-caption text-muted-foreground">
                    novo teto
                  </p>
                  <p
                    className={cn(
                      "text-body font-medium tabular-nums",
                      delta > 0n
                        ? "text-brand-accent-strong"
                        : delta < 0n
                          ? "text-destructive"
                          : "text-foreground",
                    )}
                  >
                    {valid ? (
                      <>
                        <MoneyDisplay cents={String(nextTotal)} />
                        {changed ? (
                          <span className="ml-1.5 text-caption">
                            {delta > 0n ? "+" : "−"}
                            <MoneyDisplay
                              cents={(delta < 0n ? -delta : delta).toString()}
                            />
                          </span>
                        ) : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>

              <dl className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-caption">
                <div className="flex items-center gap-1.5">
                  <dt className="text-muted-foreground">já comprometido</dt>
                  <dd className="font-medium text-foreground tabular-nums">
                    <MoneyDisplay cents={committedCents} />
                  </dd>
                </div>

                <div className="flex items-center gap-1.5">
                  <dt className="text-muted-foreground">passa a sobrar</dt>
                  <dd
                    className={cn(
                      "font-medium tabular-nums",
                      belowCommitted
                        ? "text-destructive"
                        : "text-brand-accent-strong",
                    )}
                  >
                    <MoneyDisplay cents={String(nextAvailable)} />
                  </dd>
                </div>
              </dl>
            </section>

            {belowCommitted ? (
              <p className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-caption leading-relaxed text-foreground">
                <Warning
                  size={15}
                  weight="fill"
                  className="mt-px shrink-0 text-destructive"
                  aria-hidden
                />
                <span>
                  O novo teto fica abaixo do que já foi comprometido. O período
                  passa a estourado assim que você salvar, e nenhum pedido novo
                  terá saldo.
                </span>
              </p>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="budget-reason"
                className="flex items-baseline gap-2 text-label text-foreground"
              >
                Motivo
                <span className="text-caption font-normal text-muted-foreground">
                  opcional, fica no histórico
                </span>
              </Label>
              <Input
                id="budget-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reforço aprovado pela diretoria"
                maxLength={500}
                autoComplete="off"
                className="h-10 text-body md:text-body"
              />
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
              disabled={!changed || update.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {update.isPending ? "Salvando…" : "Salvar teto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
