import type { ApprovalRule } from "@/api/approval-rules"
import { Skeleton } from "@/components/ui/skeleton"
import { useApprovalRules } from "@/hooks/approval-rules/use-approval-rules"
import { formatCents } from "@/lib/money"
import { APPROVER_TYPE_LABELS } from "@/types/enums"

import { StepFrame } from "./step-frame"

function rangeLabel(rule: ApprovalRule): string {
  const min = formatCents(rule.minAmountCents)

  if (rule.maxAmountCents === null) {
    return `Acima de ${min}`
  }

  if (rule.minAmountCents === "0") {
    return `Até ${formatCents(rule.maxAmountCents)}`
  }

  return `${min} a ${formatCents(rule.maxAmountCents)}`
}

export function MatrixStep({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  const { data: rules = [], isPending } = useApprovalRules()

  const ordered = [...rules].sort(
    (a, b) => Number(a.minAmountCents) - Number(b.minAmountCents),
  )

  return (
    <StepFrame
      question="Quem aprova o quê?"
      support="Quanto maior o valor, mais alto o pedido sobe. Estas são as faixas configuradas para a sua empresa — você ajusta os valores depois, em Configurações."
      onBack={onBack}
      onNext={onNext}
    >
      {isPending ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((index) => (
            <li key={index}>
              <Skeleton className="h-16 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      ) : ordered.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {ordered.map((rule, index) => (
            <li
              key={rule.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-semibold text-muted-foreground tabular-nums">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-foreground tabular-nums">
                  {rangeLabel(rule)}
                </p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {APPROVER_TYPE_LABELS[rule.approverType]}
                </p>
              </div>

              <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-overline font-medium normal-case tracking-normal text-muted-foreground">
                {rule.requiresDualApproval
                  ? "2 assinaturas"
                  : "1 assinatura"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-caption leading-relaxed text-muted-foreground">
          Nenhuma faixa configurada ainda. Sem matriz de alçadas, os pedidos
          ficam sem rota de aprovação — defina as faixas em Configurações antes
          de abrir o primeiro pedido.
        </p>
      )}
    </StepFrame>
  )
}
