import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { PlanWithUsage } from "@/api/platform"
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
import { Switch } from "@/components/ui/switch"
import {
  useCreatePlan,
  useFeatureCatalog,
  useUpdatePlan,
} from "@/hooks/platform/use-platform"
import { PLAN_TIER_LABELS } from "@/types/enums"

const TIERS = ["BASIC", "PROFESSIONAL", "ENTERPRISE"] as const

type Tier = (typeof TIERS)[number]

function toGigabytes(bytes: string | null): string {
  return bytes === null ? "" : String(Math.round(Number(bytes) / 1024 ** 3))
}

function toBytes(gigabytes: string): string | null {
  const value = Number(gigabytes)

  return value > 0 ? String(value * 1024 ** 3) : null
}

export function PlanDialog({
  plan,
  takenTiers,
  open,
  onOpenChange,
}: {
  plan: PlanWithUsage | null
  takenTiers: Tier[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const editing = plan !== null

  const [name, setName] = useState(plan?.name ?? "")
  const [tier, setTier] = useState<Tier | null>((plan?.tier as Tier) ?? null)
  const [price, setPrice] = useState(plan?.priceCents ?? "")
  const [members, setMembers] = useState(
    plan?.maxMembers === null || plan === null ? "" : String(plan.maxMembers),
  )
  const [requests, setRequests] = useState(
    plan?.maxRequestsMonth === null || plan === null
      ? ""
      : String(plan.maxRequestsMonth),
  )
  const [storage, setStorage] = useState(toGigabytes(plan?.maxStorageBytes ?? null))
  const [features, setFeatures] = useState<string[]>(plan?.features ?? [])

  const catalog = useFeatureCatalog()
  const create = useCreatePlan()
  const update = useUpdatePlan(plan?.id ?? "")

  const pending = create.isPending || update.isPending
  const freeTiers = TIERS.filter((value) => !takenTiers.includes(value))

  const nameError =
    name.trim().length > 0 && name.trim().length < 2
      ? "Pelo menos 2 caracteres."
      : undefined

  const ready =
    name.trim().length >= 2 &&
    Number(price) > 0 &&
    (editing || tier !== null) &&
    !pending

  function toggle(key: string) {
    setFeatures((list) =>
      list.includes(key)
        ? list.filter((item) => item !== key)
        : [...list, key],
    )
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!ready) {
      return
    }

    const shared = {
      name: name.trim(),
      priceCents: price,
      maxMembers: members.trim() === "" ? null : Number(members),
      maxRequestsMonth: requests.trim() === "" ? null : Number(requests),
      maxStorageBytes: toBytes(storage),
      features,
    }

    const handlers = {
      onSuccess: () => {
        toast.success(editing ? "Plano atualizado." : "Plano criado.")
        onOpenChange(false)
      },
      onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
    }

    if (editing) {
      update.mutate(shared, handlers)
      return
    }

    create.mutate({ ...shared, tier: tier as Tier }, handlers)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              {editing ? `Editar ${plan.name}` : "Novo plano"}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              {editing
                ? "A mudança vale para quem já assina, na próxima renovação."
                : "Cada faixa comporta um plano só. Faixas já usadas não aparecem na lista."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-name" className="text-label text-foreground">
                  Nome
                </Label>
                <Input
                  id="plan-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(nameError)}
                  placeholder="Profissional"
                  className="h-10 text-body md:text-body"
                />
                {nameError ? (
                  <p className="text-caption text-destructive">{nameError}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-label text-foreground">Faixa</Label>
                {editing ? (
                  <p className="flex h-10 items-center text-body text-muted-foreground">
                    {PLAN_TIER_LABELS[plan.tier] ?? plan.tier}
                  </p>
                ) : (
                  <Select
                    value={tier}
                    onValueChange={(next) => setTier(next as Tier | null)}
                  >
                    <SelectTrigger className="h-10 bg-card px-3" aria-label="Faixa">
                      <SelectValue>
                        {(value: Tier | null) =>
                          value ? PLAN_TIER_LABELS[value] : "Escolher faixa"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {freeTiers.map((value) => (
                        <SelectItem key={value} value={value}>
                          {PLAN_TIER_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!editing && freeTiers.length === 0 ? (
                  <p className="text-caption text-warning-strong">
                    As três faixas já têm plano. Edite um existente.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-label text-foreground">Mensalidade</Label>
              <MoneyInput
                value={price}
                onChange={setPrice}
                ariaLabel="Mensalidade do plano"
                className="h-10 w-48"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  id: "plan-requests",
                  label: "Pedidos/mês",
                  value: requests,
                  set: setRequests,
                },
                {
                  id: "plan-members",
                  label: "Pessoas",
                  value: members,
                  set: setMembers,
                },
                {
                  id: "plan-storage",
                  label: "Anexos (GB)",
                  value: storage,
                  set: setStorage,
                },
              ].map((field) => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={field.id}
                    className="text-label text-foreground"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    value={field.value}
                    onChange={(event) => field.set(event.target.value)}
                    inputMode="numeric"
                    placeholder="Ilimitado"
                    className="h-10 tabular-nums text-body md:text-body"
                  />
                </div>
              ))}
            </div>

            <p className="-mt-1 text-caption leading-relaxed text-muted-foreground">
              Campo vazio significa sem limite. O eixo de cobrança é o volume de
              pedidos — deixe pessoas em branco para não punir quem coloca mais
              aprovadores na matriz.
            </p>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Label className="text-label text-foreground">
                Funcionalidades incluídas
              </Label>

              <div className="flex flex-col gap-2.5">
                {(catalog.data ?? []).map((feature) => (
                  <label
                    key={feature.key}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="min-w-0 text-caption text-foreground">
                      {feature.label}
                    </span>
                    <Switch
                      checked={features.includes(feature.key)}
                      onCheckedChange={() => toggle(feature.key)}
                      aria-label={feature.label}
                    />
                  </label>
                ))}
              </div>

              <p className="text-caption leading-relaxed text-muted-foreground">
                Só estas chaves são verificadas pelo sistema. Conceder qualquer
                outra coisa não libera nada.
              </p>
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
              type="submit"
              disabled={!ready}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {pending ? "Salvando…" : editing ? "Salvar" : "Criar plano"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
