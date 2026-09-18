import { WarningCircle } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { PurchaseRequest, RequestBudget } from "@/api/purchase-requests"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDecideRequest,
  useRequestBudget,
} from "@/hooks/purchase-requests/use-purchase-requests"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import { DecisionType } from "@/types/enums"

const MIN_JUSTIFICATION = 10

interface Choice {
  type: DecisionType
  label: string
  hint: string
  action: string
  done: string
  prompt?: string
  destructive?: boolean
}

const APPROVE: Choice = {
  type: DecisionType.APPROVED,
  label: "Aprovar",
  hint: "Segue para a próxima etapa ou libera a compra.",
  action: "Aprovar",
  done: "aprovado",
}

const APPROVE_OVER_BUDGET: Choice = {
  type: DecisionType.APPROVED_WITH_OVERRIDE,
  label: "Aprovar com ressalva",
  hint: "Aprova acima do orçamento e registra o motivo.",
  action: "Aprovar com ressalva",
  done: "aprovado com ressalva",
  prompt: "Por que aprovar mesmo passando do orçamento?",
}

const REQUEST_CHANGES: Choice = {
  type: DecisionType.CHANGES_REQUESTED,
  label: "Pedir ajustes",
  hint: "Devolve para quem pediu corrigir.",
  action: "Devolver para ajustes",
  done: "devolvido para ajustes",
  prompt: "O que precisa ser ajustado?",
}

const REJECT: Choice = {
  type: DecisionType.REJECTED,
  label: "Recusar",
  hint: "Encerra o pedido.",
  action: "Recusar pedido",
  done: "recusado",
  prompt: "Por que o pedido foi recusado?",
  destructive: true,
}

function share(part: bigint, total: bigint): number {
  if (total <= 0n) {
    return 0
  }

  return Math.min(Number((part * 10000n) / total) / 100, 100)
}

function BudgetLine({ label, line }: { label: string; line: RequestBudget["lines"][number] }) {
  if (line.verdict === "NO_BUDGET" || line.totalCents === null) {
    return (
      <p className="text-caption text-muted-foreground">
        {label} não tem orçamento cadastrado para este mês.
      </p>
    )
  }

  const total = BigInt(line.totalCents)
  const committed = BigInt(line.committedCents ?? "0")
  const amount = BigInt(line.amountCents)
  const available = BigInt(line.availableCents ?? "0")
  const overBudget = line.verdict === "REQUIRES_OVERRIDE"
  const withinTolerance = line.verdict === "WITHIN_TOLERANCE"

  const committedShare = share(committed, total)
  const requestShare = Math.min(share(amount, total), 100 - committedShare)

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-caption text-muted-foreground">
          Orçamento de {label} no mês
        </span>
        <span className="text-caption tabular-nums text-foreground">
          {formatCents(available > 0n ? available : 0n)} livres
        </span>
      </div>

      <div
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${committedShare.toFixed(0)}% já comprometido, este pedido ocupa mais ${requestShare.toFixed(0)}%`}
      >
        <span
          className="h-full bg-foreground/25"
          style={{ width: `${committedShare}%` }}
        />
        <span
          className={cn(
            "h-full",
            overBudget ? "bg-warning" : "bg-primary",
          )}
          style={{ width: `${requestShare}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-micro tabular-nums text-muted-foreground">
        <span>{formatCents(committed)} comprometido</span>
        <span>de {formatCents(total)}</span>
      </div>

      {overBudget ? (
        <p className="mt-1 flex items-start gap-2 text-caption text-warning-strong">
          <WarningCircle
            size={15}
            weight="fill"
            aria-hidden
            className="mt-px shrink-0"
          />
          <span>
            Este pedido passa {formatCents(line.overrunCents ?? "0")} do que
            sobra. Só dá para aprovar com ressalva.
          </span>
        </p>
      ) : null}

      {withinTolerance ? (
        <p className="mt-1 text-caption text-muted-foreground">
          Passa {formatCents(line.overrunCents ?? "0")} do que sobra, dentro
          da tolerância da empresa.
        </p>
      ) : null}
    </div>
  )
}

function BudgetSummary({
  budget,
  costCenterName,
  loading,
  failed,
  onRetry,
}: {
  budget: RequestBudget | undefined
  costCenterName: string | undefined
  loading: boolean
  failed: boolean
  onRetry: () => void
}) {
  const scope = costCenterName ?? "este centro de custo"

  if (loading) {
    return <Skeleton className="h-[74px] w-full rounded-lg" />
  }

  if (failed || !budget) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5">
        <span className="text-caption text-muted-foreground">
          Não foi possível carregar o orçamento de {scope}.
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="shrink-0 font-medium"
        >
          Tentar de novo
        </Button>
      </div>
    )
  }

  if (budget.lines.length <= 1) {
    return <BudgetLine label={scope} line={budget.lines[0] ?? budget} />
  }

  return (
    <div className="flex flex-col gap-4 divide-y divide-border/60">
      {budget.lines.map((line) => (
        <div key={line.costCenterId} className="pt-4 first:pt-0">
          <BudgetLine label={line.costCenterName} line={line} />
        </div>
      ))}
    </div>
  )
}

export function DecideDialog({
  request,
  costCenterName,
  open,
  onOpenChange,
}: {
  request: PurchaseRequest
  costCenterName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [picked, setPicked] = useState<DecisionType | null>(null)
  const [justification, setJustification] = useState("")

  const decide = useDecideRequest(request.id)
  const budgetQuery = useRequestBudget(request.id, open)

  const overBudget = budgetQuery.data?.verdict === "REQUIRES_OVERRIDE"
  const choices = [
    overBudget ? APPROVE_OVER_BUDGET : APPROVE,
    REQUEST_CHANGES,
    REJECT,
  ]
  const selected =
    choices.find((choice) => choice.type === picked) ?? choices[0]

  const typed = justification.trim().length
  const missingJustification =
    Boolean(selected.prompt) && typed < MIN_JUSTIFICATION

  const approving =
    selected.type === DecisionType.APPROVED ||
    selected.type === DecisionType.APPROVED_WITH_OVERRIDE
  const budgetUnknown = budgetQuery.isPending || budgetQuery.isError

  function close(next: boolean) {
    if (!next) {
      setPicked(null)
      setJustification("")
    }

    onOpenChange(next)
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (missingJustification) {
      return
    }

    decide.mutate(
      {
        type: selected.type,
        ...(selected.prompt ? { justification: justification.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success(`Pedido ${request.number} ${selected.done}.`)
          close(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-heading">Decidir pedido</DialogTitle>
            <DialogDescription className="text-caption">
              {request.number} · {request.title}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="flex items-baseline justify-between gap-3 border-b border-border pb-4">
              <span className="text-caption text-muted-foreground">
                Valor do pedido
              </span>
              <span className="text-heading font-semibold tabular-nums text-foreground">
                {formatCents(request.totalAmountCents)}
              </span>
            </div>

            <BudgetSummary
              budget={budgetQuery.data}
              costCenterName={costCenterName}
              loading={budgetQuery.isPending}
              failed={budgetQuery.isError}
              onRetry={() => void budgetQuery.refetch()}
            />

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-label text-foreground">
                Decisão
              </legend>

              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {choices.map((choice) => {
                  const active = choice.type === selected.type

                  return (
                    <label
                      key={choice.type}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 px-3.5 py-3 transition-colors",
                        active ? "bg-muted/50" : "hover:bg-muted/30",
                      )}
                    >
                      <input
                        type="radio"
                        name="decision"
                        value={choice.type}
                        checked={active}
                        onChange={() => setPicked(choice.type)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border bg-card transition-colors",
                          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                          active
                            ? choice.destructive
                              ? "border-destructive"
                              : "border-primary"
                            : "border-input",
                        )}
                      >
                        {active ? (
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              choice.destructive ? "bg-destructive" : "bg-primary",
                            )}
                          />
                        ) : null}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-caption font-medium text-foreground">
                          {choice.label}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {choice.hint}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {selected.prompt ? (
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="justification"
                  className="text-label text-foreground"
                >
                  {selected.prompt}
                </Label>
                <textarea
                  id="justification"
                  value={justification}
                  onChange={(event) => setJustification(event.target.value)}
                  rows={3}
                  className={cn(
                    "w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                  placeholder="Quem pediu recebe essa resposta."
                />
                <p className="text-micro tabular-nums text-muted-foreground">
                  {typed < MIN_JUSTIFICATION
                    ? `${typed}/${MIN_JUSTIFICATION} caracteres no mínimo`
                    : "Fica registrado no histórico do pedido."}
                </p>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose
              render={<Button variant="ghost" type="button" className="font-medium" />}
            >
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={
                missingJustification ||
                decide.isPending ||
                (approving && budgetUnknown)
              }
              className={cn(
                "font-medium",
                selected.destructive
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover",
              )}
            >
              {decide.isPending ? "Registrando…" : selected.action}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
