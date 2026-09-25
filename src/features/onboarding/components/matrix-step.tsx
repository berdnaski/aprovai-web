import { Plus, Trash } from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import { MoneyInput } from "@/components/ui/money-input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useApprovalRules,
  useReplaceApprovalMatrix,
} from "@/hooks/approval-rules/use-approval-rules"
import { cn } from "@/lib/utils"

import { SignatureChoice } from "@/features/approval-rules/components/signature-choice"
import {
  GLOBAL_SCOPE,
  floorOf,
  insertTierAfter,
  isMatrixEqual,
  MAX_TIERS,
  boundaryLabel,
  rangeLabel,
  removeTier,
  seedTiers,
  toRanges,
  toTiers,
  updateTier,
  validateTiers,
  type Tier,
} from "@/features/approval-rules/matrix"

import { StepFrame } from "./step-frame"

export function MatrixStep({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  const { data: rules, isPending } = useApprovalRules()
  const replace = useReplaceApprovalMatrix()

  const [draft, setDraft] = useState<Tier[] | null>(null)

  const saved = useMemo(
    () => (rules ? (rules.length > 0 ? toTiers(rules) : seedTiers()) : []),
    [rules],
  )

  const tiers = draft ?? saved
  const setTiers = (update: (current: Tier[]) => Tier[]) =>
    setDraft((current) => update(current ?? saved))

  const problems = validateTiers(tiers)
  const problemOf = (key: string) =>
    problems.find((problem) => problem.key === key)?.message

  function handleNext() {
    if (problems.length > 0) {
      return
    }

    if (isMatrixEqual(tiers, saved)) {
      onNext()
      return
    }

    replace.mutate(
      { ...GLOBAL_SCOPE, ranges: toRanges(tiers) },
      {
        onSuccess: () => {
          setDraft(null)
          onNext()
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <StepFrame
      question="A partir de que valor um pedido precisa de duas assinaturas?"
      support="Como você é Admin Financeiro, já aprova qualquer pedido sozinho — nada trava se pular esta etapa. Ela só serve para pedir uma segunda assinatura a partir de um valor, se a empresa quiser esse controle a mais."
      onBack={onBack}
      onNext={handleNext}
      nextDisabled={problems.length > 0}
      isSubmitting={replace.isPending}
      hint="Dá para mudar depois, e criar exceções por Centro de Custo ou categoria, em Matriz de alçadas."
    >
      {isPending ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((index) => (
            <li key={index}>
              <Skeleton className="h-28 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-2">
          {tiers.map((tier, index) => {
            const last = index === tiers.length - 1
            const floor = floorOf(tiers, index)
            const problem = problemOf(tier.key)

            return (
              <div
                key={tier.key}
                className={cn(
                  "flex flex-col gap-4 rounded-xl border bg-card px-4 py-4",
                  problem ? "border-destructive/40" : "border-border",
                )}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-semibold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>

                  {last ? (
                    <p className="text-body font-semibold tabular-nums text-foreground">
                      {rangeLabel(floor, null)}
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-caption text-muted-foreground">
                        {floor === "0" ? "Até" : `${boundaryLabel(floor)} até`}
                      </span>
                      <MoneyInput
                        value={tier.ceilingCents ?? ""}
                        onChange={(cents) =>
                          setTiers((current) =>
                            updateTier(current, index, { ceilingCents: cents }),
                          )
                        }
                        size="sm"
                        invalid={Boolean(problem)}
                        ariaLabel={`Teto da faixa ${index + 1}`}
                        className="w-36"
                      />
                    </div>
                  )}

                  {tiers.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setTiers((current) => removeTier(current, index))
                      }
                      aria-label={`Remover faixa ${index + 1}`}
                      className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <Trash size={14} aria-hidden />
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <SignatureChoice
                    value={tier.requiresDualApproval}
                    onChange={(requiresDualApproval) =>
                      setTiers((current) =>
                        updateTier(current, index, { requiresDualApproval }),
                      )
                    }
                    className="flex-1"
                  />
                </div>

                {problem ? (
                  <p role="alert" className="text-caption text-destructive">
                    {problem}
                  </p>
                ) : null}
              </div>
            )
          })}

          {tiers.length < MAX_TIERS ? (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setTiers((current) =>
                  insertTierAfter(current, current.length - 1),
                )
              }
              className="self-start gap-1.5 font-medium"
            >
              <Plus size={14} aria-hidden />
              Adicionar faixa
            </Button>
          ) : null}
        </div>
      )}
    </StepFrame>
  )
}
