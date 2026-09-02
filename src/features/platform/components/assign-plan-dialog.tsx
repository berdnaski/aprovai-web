import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Organization, Plan } from "@/api/platform"
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
import { MoneyInput } from "@/components/ui/money-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAssignPlan } from "@/hooks/platform/use-platform"
import { cn } from "@/lib/utils"
import {
  PLAN_TIER_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  SubscriptionStatus,
} from "@/types/enums"

export function AssignPlanDialog({
  organization,
  plans,
  open,
  onOpenChange,
}: {
  organization: Organization
  plans: Plan[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [planId, setPlanId] = useState<string | null>(
    organization.plan?.id ?? null,
  )
  const [status, setStatus] = useState<SubscriptionStatus>(
    organization.subscriptionStatus ?? SubscriptionStatus.ACTIVE,
  )
  const [negotiated, setNegotiated] = useState("")

  const assign = useAssignPlan(organization.companyId)

  const chosen = plans.find((plan) => plan.id === planId)
  const changing = organization.plan !== null && organization.plan.id !== planId

  const seatsOver =
    chosen?.maxMembers !== null &&
    chosen !== undefined &&
    organization.usedSeats > (chosen.maxMembers ?? 0)

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!planId) {
      return
    }

    assign.mutate(
      {
        planId,
        status,
        ...(Number(negotiated) > 0
          ? { contractedPriceCents: negotiated }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success("Plano atribuído.")
          onOpenChange(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              {organization.plan ? "Trocar o plano" : "Atribuir um plano"}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              {organization.plan
                ? "A assinatura atual é encerrada e uma nova começa hoje."
                : "A assinatura começa hoje e vale até você trocar ou cancelar."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">Plano</Label>
              <Select
                value={planId}
                onValueChange={(next) => setPlanId(next as string | null)}
              >
                <SelectTrigger className="h-10 bg-card px-3" aria-label="Plano">
                  <SelectValue>
                    {(value: string | null) =>
                      plans.find((plan) => plan.id === value)?.name ??
                      "Escolher plano"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} · {PLAN_TIER_LABELS[plan.tier] ?? plan.tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {chosen ? (
                <p className="text-caption text-muted-foreground">
                  <MoneyDisplay cents={chosen.priceCents} /> por mês ·{" "}
                  {chosen.maxMembers === null
                    ? "usuários ilimitados"
                    : `${chosen.maxMembers} usuários`}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">Situação</Label>
              <Select
                value={status}
                onValueChange={(next) => setStatus(next as SubscriptionStatus)}
              >
                <SelectTrigger
                  className="h-10 bg-card px-3"
                  aria-label="Situação da assinatura"
                >
                  <SelectValue>
                    {(value: SubscriptionStatus) =>
                      SUBSCRIPTION_STATUS_LABELS[value]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SubscriptionStatus).map((value) => (
                    <SelectItem key={value} value={value}>
                      {SUBSCRIPTION_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">
                Preço negociado
              </Label>
              <MoneyInput
                value={negotiated}
                onChange={setNegotiated}
                ariaLabel="Preço negociado"
                className="h-10 w-full"
              />
              <p className="text-caption text-muted-foreground">
                Deixe vazio para cobrar o preço de tabela.
              </p>
            </div>

            {seatsOver ? (
              <p
                className={cn(
                  "rounded-lg border border-warning/25 bg-warning/[0.06] px-3 py-2.5",
                  "text-caption leading-relaxed text-warning-strong",
                )}
              >
                A organização já usa {organization.usedSeats} vagas, acima do
                limite deste plano. Ninguém é removido, mas novos convites são
                recusados até liberarem vaga.
              </p>
            ) : null}

            {changing ? (
              <p className="text-caption leading-relaxed text-muted-foreground">
                A assinatura de {organization.plan?.name} é encerrada nesta
                troca.
              </p>
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
              disabled={!planId || assign.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {assign.isPending ? "Salvando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
