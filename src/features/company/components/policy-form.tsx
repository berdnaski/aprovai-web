import { ArrowRight } from "@phosphor-icons/react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import type { Company, UpdateCompanyPolicyPayload } from "@/api/companies"
import { getApiErrorMessage } from "@/api/client"
import { MoneyDisplay } from "@/components/shared/money-display"
import {
  SettingActions,
  SettingGroup,
  SettingRow,
} from "@/components/shared/setting-row"
import { MoneyInput } from "@/components/ui/money-input"
import { Switch } from "@/components/ui/switch"
import { useApprovalRules } from "@/hooks/approval-rules/use-approval-rules"
import { useUpdateCompanyPolicy } from "@/hooks/companies/use-companies"
import { formatCents } from "@/lib/money"

import {
  HOUR_PRESETS,
  OVERRUN_PRESETS,
  applyTolerance,
  formatPercent,
  hoursLabel,
  parseInteger,
  parsePercent,
} from "../policy"
import { Presets, SuffixInput } from "./policy-controls"

const EXAMPLE_CAP = "1000000"

interface Draft {
  overrun: string
  reminder: string
  escalation: string
  dualEnabled: boolean
  dualThreshold: string
}

function toDraft(company: Company): Draft {
  return {
    overrun: formatPercent(company.overrunTolerancePercent),
    reminder: String(company.reminderHours),
    escalation: String(company.escalationHours),
    dualEnabled: company.dualApprovalThresholdCents !== null,
    dualThreshold: company.dualApprovalThresholdCents ?? "",
  }
}

function DualApprovalImpact({ thresholdCents }: { thresholdCents: string }) {
  const { data: rules = [] } = useApprovalRules()

  const globalTiers = rules.filter(
    (rule) => rule.costCenterId === null && rule.categoryId === null,
  )

  if (globalTiers.length === 0) {
    return <>Vale para todo pedido a partir deste valor.</>
  }

  const threshold = BigInt(thresholdCents)
  const affected = globalTiers.filter(
    (rule) => BigInt(rule.minAmountCents) >= threshold,
  ).length

  return (
    <>
      {affected === 0 ? (
        <>Nenhuma faixa da matriz começa acima deste valor.</>
      ) : (
        <>
          {affected} de {globalTiers.length}{" "}
          {globalTiers.length === 1 ? "faixa" : "faixas"} da matriz
          {affected === 1 ? " passa" : " passam"} a exigir duas assinaturas,
          mesmo marcadas com uma.
        </>
      )}{" "}
      <Link
        to="/matriz-de-alcadas"
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        Ver matriz
      </Link>
    </>
  )
}

export function PolicyForm({ company }: { company: Company }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(company))
  const update = useUpdateCompanyPolicy()

  const saved = toDraft(company)

  const overrun = parsePercent(draft.overrun)
  const reminder = parseInteger(draft.reminder)
  const escalation = parseInteger(draft.escalation)

  const overrunError =
    overrun === null
      ? "Informe um percentual."
      : overrun < 0 || overrun > 100
        ? "Precisa ficar entre 0% e 100%."
        : undefined

  const reminderError =
    reminder === null || reminder < 1 || reminder > 720
      ? "Precisa ficar entre 1 e 720 horas."
      : undefined

  const escalationError =
    escalation === null || escalation < 1 || escalation > 720
      ? "Precisa ficar entre 1 e 720 horas."
      : reminder !== null && escalation <= reminder
        ? "Precisa vir depois do lembrete."
        : undefined

  const dualError =
    draft.dualEnabled && Number(draft.dualThreshold || "0") <= 0
      ? "Informe o valor a partir do qual a segunda assinatura vale."
      : undefined

  const blocked = Boolean(
    overrunError || reminderError || escalationError || dualError,
  )

  const numeric: Partial<Record<keyof Draft, (value: string) => number | null>> =
    {
      overrun: parsePercent,
      reminder: parseInteger,
      escalation: parseInteger,
    }

  const changed = (Object.keys(saved) as (keyof Draft)[]).filter((key) => {
    const parse = numeric[key]

    return parse
      ? parse(String(draft[key])) !== parse(String(saved[key]))
      : draft[key] !== saved[key]
  })

  const dirtyCount = changed.filter(
    (key) => !(key === "dualThreshold" && !draft.dualEnabled),
  ).length

  function set(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function submit() {
    const payload: UpdateCompanyPolicyPayload = {}

    if (changed.includes("overrun") && overrun !== null) {
      payload.overrunTolerancePercent = overrun
    }

    if (changed.includes("reminder") && reminder !== null) {
      payload.reminderHours = reminder
    }

    if (changed.includes("escalation") && escalation !== null) {
      payload.escalationHours = escalation
    }

    if (changed.includes("dualEnabled") || changed.includes("dualThreshold")) {
      payload.dualApprovalThresholdCents = draft.dualEnabled
        ? draft.dualThreshold
        : null
    }

    update.mutate(payload, {
      onSuccess: () => toast.success("Política atualizada."),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (dirtyCount > 0 && !blocked && !update.isPending) {
          submit()
        }
      }}
      className="flex flex-col gap-4"
    >
      <SettingGroup
        title="Orçamento"
        description="Quanto um pedido pode passar do teto do Centro de Custo antes de ser barrado."
      >
        <SettingRow
          label="Tolerância"
          description="Sobre o teto do período"
          error={overrunError}
          hint={
            overrun !== null && overrun > 0 ? (
              <>
                Um centro com <MoneyDisplay cents={EXAMPLE_CAP} /> de teto aceita
                pedidos até{" "}
                <span className="font-medium text-foreground">
                  {formatCents(applyTolerance(EXAMPLE_CAP, overrun))}
                </span>
                .
              </>
            ) : overrun === 0 ? (
              <>
                Sem folga: o pedido que passar de{" "}
                <MoneyDisplay cents={EXAMPLE_CAP} /> em um centro com esse teto é
                barrado.
              </>
            ) : undefined
          }
          control={
            <>
              <SuffixInput
                value={draft.overrun}
                onChange={(value) => set({ overrun: value })}
                suffix="%"
                invalid={Boolean(overrunError)}
                ariaLabel="Tolerância de estouro de orçamento"
              />
              <Presets
                options={OVERRUN_PRESETS}
                value={overrun}
                onSelect={(option) => set({ overrun: formatPercent(option) })}
                format={(option) => `${option}%`}
              />
            </>
          }
        />
      </SettingGroup>

      <SettingGroup
        title="Pedido parado"
        description="Sem decisão, o pedido primeiro lembra o aprovador; se continuar parado, sobe para o superior dele."
      >
        <SettingRow
          label="Lembrete"
          description="Horas úteis"
          error={reminderError}
          control={
            <>
              <SuffixInput
                value={draft.reminder}
                onChange={(value) => set({ reminder: value })}
                suffix="h"
                invalid={Boolean(reminderError)}
                ariaLabel="Horas até o lembrete"
              />
              <Presets
                options={HOUR_PRESETS}
                value={reminder}
                onSelect={(option) => set({ reminder: String(option) })}
                format={(option) => `${option}h`}
              />
            </>
          }
        />

        <SettingRow
          label="Escalonamento"
          description="Horas úteis"
          error={escalationError}
          hint={
            reminder !== null && escalation !== null && !escalationError && !reminderError ? (
              <span className="flex flex-wrap items-center gap-1.5">
                Entra
                <ArrowRight size={11} weight="bold" aria-hidden className="opacity-50" />
                lembra em{" "}
                <span className="font-medium text-foreground">
                  {hoursLabel(reminder)}
                </span>
                <ArrowRight size={11} weight="bold" aria-hidden className="opacity-50" />
                escala em{" "}
                <span className="font-medium text-foreground">
                  {hoursLabel(escalation)}
                </span>
              </span>
            ) : undefined
          }
          control={
            <>
              <SuffixInput
                value={draft.escalation}
                onChange={(value) => set({ escalation: value })}
                suffix="h"
                invalid={Boolean(escalationError)}
                ariaLabel="Horas até o escalonamento"
              />
              <Presets
                options={HOUR_PRESETS}
                value={escalation}
                onSelect={(option) => set({ escalation: String(option) })}
                format={(option) => `${option}h`}
              />
            </>
          }
        />
      </SettingGroup>

      <SettingGroup
        title="Dupla assinatura"
        description="Acima de um valor, cada etapa exige duas pessoas — independente do que a matriz de alçadas disser."
        footer={
          <SettingActions
            dirtyCount={dirtyCount}
            blocked={blocked}
            pending={update.isPending}
            onReset={() => setDraft(toDraft(company))}
          />
        }
      >
        <SettingRow
          label="Exigir a partir de"
          error={dualError}
          hint={
            draft.dualEnabled && !dualError ? (
              <DualApprovalImpact thresholdCents={draft.dualThreshold} />
            ) : !draft.dualEnabled ? (
              <>
                Só as faixas marcadas com duas assinaturas na matriz exigem a
                segunda pessoa.
              </>
            ) : undefined
          }
          control={
            <>
              <Switch
                checked={draft.dualEnabled}
                onCheckedChange={(checked) => set({ dualEnabled: checked })}
                aria-label="Exigir dupla assinatura por valor"
              />

              {draft.dualEnabled ? (
                <MoneyInput
                  value={draft.dualThreshold}
                  onChange={(cents) => set({ dualThreshold: cents })}
                  invalid={Boolean(dualError)}
                  ariaLabel="Valor a partir do qual exige duas assinaturas"
                  className="w-44"
                />
              ) : (
                <span className="text-caption text-muted-foreground">
                  Desligado
                </span>
              )}
            </>
          }
        />
      </SettingGroup>
    </form>
  )
}
