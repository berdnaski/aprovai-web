import { Check, PencilSimple, ShieldWarning, X } from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { PurchaseRequest, RequestTimeline } from "@/api/purchase-requests"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useDecideRequest } from "@/hooks/purchase-requests/use-purchase-requests"
import { cn } from "@/lib/utils"
import { DecisionType } from "@/types/enums"

import { RequestTimelineView } from "./request-timeline"

const MIN_JUSTIFICATION = 10

const OPTIONS: {
  type: DecisionType
  label: string
  detail: string
  icon: Icon
  tone: "success" | "warning" | "danger"
  needsJustification: boolean
}[] = [
  {
    type: DecisionType.APPROVED,
    label: "Aprovar",
    detail: "O pedido segue para a próxima etapa, ou é liberado.",
    icon: Check,
    tone: "success",
    needsJustification: false,
  },
  {
    type: DecisionType.APPROVED_WITH_OVERRIDE,
    label: "Aprovar com ressalva",
    detail: "Aprova mesmo estourando o orçamento. Exige justificativa.",
    icon: ShieldWarning,
    tone: "warning",
    needsJustification: true,
  },
  {
    type: DecisionType.CHANGES_REQUESTED,
    label: "Pedir ajustes",
    detail: "Volta para quem pediu corrigir. Exige justificativa.",
    icon: PencilSimple,
    tone: "warning",
    needsJustification: true,
  },
  {
    type: DecisionType.REJECTED,
    label: "Recusar",
    detail: "Encerra o pedido. Exige justificativa.",
    icon: X,
    tone: "danger",
    needsJustification: true,
  },
]

const TONE_ACTIVE: Record<string, string> = {
  success: "border-brand-accent/40 bg-brand-accent/[0.07]",
  warning: "border-warning/40 bg-warning/[0.07]",
  danger: "border-destructive/40 bg-destructive/[0.06]",
}

const TONE_ICON: Record<string, string> = {
  success: "text-brand-accent-strong",
  warning: "text-warning-strong",
  danger: "text-destructive",
}

export function DecideDialog({
  request,
  timeline,
  open,
  onOpenChange,
}: {
  request: PurchaseRequest
  timeline?: RequestTimeline
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [type, setType] = useState<DecisionType>(DecisionType.APPROVED)
  const [justification, setJustification] = useState("")

  const decide = useDecideRequest(request.id)
  const option = OPTIONS.find((item) => item.type === type)

  const tooShort =
    Boolean(option?.needsJustification) &&
    justification.trim().length < MIN_JUSTIFICATION

  function close(next: boolean) {
    if (!next) {
      setType(DecisionType.APPROVED)
      setJustification("")
    }

    onOpenChange(next)
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (tooShort) {
      return
    }

    decide.mutate(
      {
        type,
        ...(justification.trim() ? { justification: justification.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success(`Pedido ${request.number} decidido.`)
          close(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-heading">Decidir pedido</DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              {request.title} · {request.number}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <div className="flex items-baseline justify-between gap-3 rounded-md border border-border bg-muted/30 px-3.5 py-2.5">
              <span className="text-caption text-muted-foreground">
                Valor total
              </span>
              <MoneyDisplay
                cents={request.totalAmountCents}
                emphasis
                className="text-body"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-label text-foreground">Sua decisão</span>

              <div className="grid gap-1.5 sm:grid-cols-2">
                {OPTIONS.map((item) => {
                  const OptionIcon = item.icon
                  const active = type === item.type

                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setType(item.type)}
                      aria-pressed={active}
                      className={cn(
                        "flex flex-col gap-1 rounded-md border px-3 py-2.5 text-left transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        active
                          ? TONE_ACTIVE[item.tone]
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <OptionIcon
                          size={14}
                          weight="bold"
                          aria-hidden
                          className={cn(
                            "shrink-0",
                            active
                              ? TONE_ICON[item.tone]
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="text-caption font-medium text-foreground">
                          {item.label}
                        </span>
                      </span>
                      <span className="text-caption leading-relaxed text-muted-foreground">
                        {item.detail}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {option?.needsJustification ? (
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="justification"
                  className="text-label text-foreground"
                >
                  Justificativa
                </Label>
                <textarea
                  id="justification"
                  value={justification}
                  onChange={(event) => setJustification(event.target.value)}
                  rows={3}
                  aria-invalid={tooShort || undefined}
                  className={cn(
                    "w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                  placeholder="Explique para quem pediu. Fica registrado na trilha."
                />
                <p className="text-caption text-muted-foreground">
                  {justification.trim().length < MIN_JUSTIFICATION
                    ? `Mínimo de ${MIN_JUSTIFICATION} caracteres.`
                    : "Fica visível na trilha do pedido."}
                </p>
              </div>
            ) : null}

            {timeline && timeline.steps.length > 0 ? (
              <details className="rounded-md border border-border bg-card">
                <summary className="cursor-pointer px-3.5 py-2.5 text-caption text-muted-foreground">
                  Ver o que já aconteceu
                </summary>
                <div className="border-t border-border px-3.5 py-3">
                  <RequestTimelineView timeline={timeline} compact />
                </div>
              </details>
            ) : null}
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
              type="submit"
              disabled={tooShort || decide.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {decide.isPending ? "Registrando…" : "Registrar decisão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
