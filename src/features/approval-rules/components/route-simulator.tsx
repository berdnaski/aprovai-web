import {
  ArrowRight,
  CalendarBlank,
  Info,
  Play,
  WarningCircle,
} from "@phosphor-icons/react"
import { useState } from "react"
import { Link } from "react-router-dom"

import type { ApprovalRule, SimulatedRoute } from "@/api/approval-rules"
import { getApiErrorDetails, getApiErrorMessage } from "@/api/client"
import type { Category } from "@/api/categories"
import type { CostCenter } from "@/api/cost-centers"
import type { Member } from "@/api/members"
import { PersonPicker } from "@/components/shared/person-picker"
import { Button } from "@/components/ui/button"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSimulateRoute } from "@/hooks/approval-rules/use-approval-rules"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import {
  compareCents,
  describeScope,
  rangeLabel,
  scopeKey,
  type ScopeNames,
} from "../matrix"
import { ApprovalChain } from "./approval-chain"

interface Failure {
  message: string
  fix?: { label: string; to: string }
}

function readFailure(error: unknown): Failure {
  const message = getApiErrorMessage(error)
  const details = getApiErrorDetails(error)
  const rule = details?.rule

  if (rule === "RN27") {
    return {
      message,
      fix: { label: "Ajustar alçadas e líderes na Equipe", to: "/equipe" },
    }
  }

  if (rule === "RN24" && details?.memberId) {
    return {
      message,
      fix: { label: "Revisar quem reporta a quem", to: "/equipe" },
    }
  }

  return { message }
}

function locate(
  rules: ApprovalRule[],
  ruleId: string,
): { scopeKey: string; index: number } | null {
  const rule = rules.find((item) => item.id === ruleId)

  if (!rule) {
    return null
  }

  const scope = { costCenterId: rule.costCenterId, categoryId: rule.categoryId }

  const index = rules
    .filter(
      (item) =>
        item.costCenterId === rule.costCenterId &&
        item.categoryId === rule.categoryId,
    )
    .sort((a, b) => compareCents(a.minAmountCents, b.minAmountCents))
    .findIndex((item) => item.id === rule.id)

  return index === -1 ? null : { scopeKey: scopeKey(scope), index }
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-label text-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-caption text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function MatchedRule({
  rule,
  rules,
  names,
}: {
  rule: ApprovalRule | undefined
  rules: ApprovalRule[]
  names: ScopeNames
}) {
  if (!rule) {
    return null
  }

  const scope = describeScope(
    { costCenterId: rule.costCenterId, categoryId: rule.categoryId },
    names,
  )

  const siblings = rules
    .filter(
      (item) =>
        item.costCenterId === rule.costCenterId &&
        item.categoryId === rule.categoryId,
    )
    .sort((a, b) => compareCents(a.minAmountCents, b.minAmountCents))

  const position = siblings.findIndex((item) => item.id === rule.id) + 1

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-3">
      <p className="text-overline text-muted-foreground/70">Faixa aplicada</p>
      <p className="mt-1 text-caption font-medium tabular-nums text-foreground">
        {rangeLabel(rule.minAmountCents, rule.maxAmountCents)}
      </p>
      <p className="mt-0.5 text-caption text-muted-foreground">
        {position > 0 ? `Faixa ${position} de ` : ""}
        {scope.title}
      </p>
    </div>
  )
}

export function RouteSimulator({
  open,
  onOpenChange,
  rules,
  names,
  costCenters,
  categories,
  members,
  hasUnsavedChanges,
  onMatch,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rules: ApprovalRule[]
  names: ScopeNames
  costCenters: CostCenter[]
  categories: Category[]
  members: Member[]
  hasUnsavedChanges: boolean
  onMatch: (match: { scopeKey: string; index: number } | null) => void
}) {
  const [amountCents, setAmountCents] = useState("")
  const [costCenterId, setCostCenterId] = useState<string | null>(null)
  const [requesterId, setRequesterId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [useDate, setUseDate] = useState(false)
  const [at, setAt] = useState("")
  const [result, setResult] = useState<SimulatedRoute | null>(null)
  const [failure, setFailure] = useState<Failure | null>(null)

  const simulate = useSimulateRoute()

  const memberIndex = new Map(members.map((member) => [member.id, member]))
  const ready = Boolean(amountCents) && Boolean(costCenterId) && Boolean(requesterId)

  function run(event: React.FormEvent) {
    event.preventDefault()

    if (!ready || !requesterId || !costCenterId) {
      return
    }

    setFailure(null)

    simulate.mutate(
      {
        amountCents,
        costCenterId,
        requesterId,
        ...(categoryId && { categoryId }),
        ...(useDate && at && { at: new Date(`${at}T12:00:00`).toISOString() }),
      },
      {
        onSuccess: (route) => {
          setResult(route)
          setFailure(null)
          onMatch(locate(rules, route.ruleId))
        },
        onError: (cause) => {
          setResult(null)
          onMatch(null)
          setFailure(readFailure(cause))
        },
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-heading">Simular rota</SheetTitle>
          <SheetDescription className="text-caption leading-relaxed">
            Roda o mesmo motor da submissão sem gravar nada — nenhum pedido é
            criado, ninguém é notificado.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={run} className="flex flex-col gap-5 px-4 py-5">
          {hasUnsavedChanges ? (
            <p className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning/[0.07] px-3 py-2.5 text-caption leading-relaxed text-warning-strong">
              <Info size={15} className="mt-px shrink-0" aria-hidden />
              A simulação usa a matriz já salva. Salve as alterações para testar
              o que você acabou de mudar.
            </p>
          ) : null}

          <Field label="Valor do pedido" htmlFor="simular-valor">
            <MoneyInput
              id="simular-valor"
              size="lg"
              value={amountCents}
              onChange={setAmountCents}
            />
          </Field>

          <Field
            label="Centro de Custo"
            hint="Define o gestor e, junto com a categoria, qual matriz vale."
          >
            <Select
              value={costCenterId}
              onValueChange={(next) =>
                setCostCenterId((next ?? null) as string | null)
              }
            >
              <SelectTrigger
                className="h-9 w-full bg-card px-3"
                aria-label="Centro de Custo"
              >
                <SelectValue>
                  {(value: string | null) =>
                    value === null
                      ? "Escolher Centro de Custo"
                      : (names.costCenters.get(value) ?? "Centro de Custo")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {costCenters.map((costCenter) => (
                  <SelectItem key={costCenter.id} value={costCenter.id}>
                    {costCenter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Quem abre o pedido"
            hint="A cadeia sobe a partir do líder desta pessoa."
          >
            <PersonPicker
              options={members.map((member) => ({ member }))}
              value={requesterId}
              onChange={setRequesterId}
              allowEmpty={false}
              placeholder="Escolher solicitante"
              className="h-9"
            />
          </Field>

          <Field label="Categoria">
            <Select
              value={categoryId}
              onValueChange={(next) =>
                setCategoryId((next ?? null) as string | null)
              }
            >
              <SelectTrigger className="h-9 w-full bg-card px-3" aria-label="Categoria">
                <SelectValue>
                  {(value: string | null) =>
                    value === null
                      ? "Qualquer categoria"
                      : (names.categories.get(value) ?? "Categoria")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Qualquer categoria</SelectItem>
                {categories
                  .filter((category) => category.active)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setUseDate((previous) => !previous)}
              aria-expanded={useDate}
              className={cn(
                "flex w-fit items-center gap-1.5 rounded-md px-1.5 py-1 -ml-1.5 text-caption transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                useDate
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <CalendarBlank size={13} aria-hidden />
              Simular em outra data
            </button>

            {useDate ? (
              <>
                <Input
                  type="date"
                  value={at}
                  onChange={(event) => setAt(event.target.value)}
                  aria-label="Data da simulação"
                  className="h-9 w-full text-body md:text-body"
                />
                <p className="text-caption text-muted-foreground">
                  Serve para conferir quem responde durante uma ausência.
                </p>
              </>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!ready || simulate.isPending}
            className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Play size={14} weight="fill" aria-hidden />
            {simulate.isPending ? "Simulando…" : "Ver quem aprova"}
          </Button>
        </form>

        {failure ? (
          <div
            role="alert"
            className="mx-4 mb-5 flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3.5 py-3"
          >
            <WarningCircle
              size={16}
              className="mt-px shrink-0 text-destructive"
              aria-hidden
            />

            <div className="min-w-0">
              <p className="text-caption leading-relaxed text-foreground">
                {failure.message}
              </p>

              {failure.fix ? (
                <Link
                  to={failure.fix.to}
                  className="mt-2 inline-flex items-center gap-1 text-caption font-medium text-primary underline-offset-2 hover:underline"
                >
                  {failure.fix.label}
                  <ArrowRight size={12} weight="bold" aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="flex flex-col gap-4 border-t border-border px-4 py-5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h3 className="text-label text-foreground">
                {result.totalSteps === 1
                  ? "1 etapa de aprovação"
                  : `${result.totalSteps} etapas de aprovação`}
              </h3>
              <span className="text-caption tabular-nums text-muted-foreground">
                para {formatCents(amountCents)}
              </span>
            </div>

            <MatchedRule
              rule={rules.find((rule) => rule.id === result.ruleId)}
              rules={rules}
              names={names}
            />

            <ApprovalChain steps={result.steps} members={memberIndex} />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
