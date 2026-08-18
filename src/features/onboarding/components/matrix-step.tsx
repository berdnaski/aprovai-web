import { StepFrame } from "./step-frame"

const DEFAULT_TIERS = [
  {
    range: "Até R$ 5.000",
    approver: "Líder direto",
    signatures: "1 assinatura",
  },
  {
    range: "R$ 5.000 a R$ 50.000",
    approver: "Gestor do Centro de Custo",
    signatures: "1 assinatura",
  },
  {
    range: "Acima de R$ 50.000",
    approver: "Gestor do Centro de Custo",
    signatures: "2 assinaturas",
  },
]

export function MatrixStep({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  return (
    <StepFrame
      question="Quem aprova o quê?"
      support="Quanto maior o valor, mais alto o pedido sobe. Começamos com estas três faixas e você ajusta os valores depois, em Configurações."
      onBack={onBack}
      onNext={onNext}
    >
      <ul className="flex flex-col gap-2">
        {DEFAULT_TIERS.map((tier, index) => (
          <li
            key={tier.range}
            className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-semibold text-muted-foreground tabular-nums">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-body font-semibold text-foreground tabular-nums">
                {tier.range}
              </p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                {tier.approver}
              </p>
            </div>

            <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-overline font-medium normal-case tracking-normal text-muted-foreground">
              {tier.signatures}
            </span>
          </li>
        ))}
      </ul>
    </StepFrame>
  )
}
