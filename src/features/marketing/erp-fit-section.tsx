import { ErpHandoff, StandaloneApp } from "@/features/marketing/fit-diagrams"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { SectionLabel } from "@/features/marketing/section-label"
import { useReveal } from "@/hooks/use-reveal"

const TITLE_GRADIENT =
  "linear-gradient(91deg, var(--foreground) 43%, color-mix(in oklab, var(--foreground) 44%, oklch(1 0 0)) 100%)"

const SCENARIOS = [
  {
    id: "sem-erp",
    chip: "Ainda não tem ERP",
    title: "O AprovAI já é o sistema inteiro",
    mockup: <StandaloneApp />,
    points: [
      "Do pedido ao pagamento",
      "Sem licença de ERP",
      "Histórico pronto pra migrar",
    ],
  },
  {
    id: "com-erp",
    chip: "Já usa um ERP",
    title: "Ele entrega pronto pro seu ERP",
    mockup: <ErpHandoff />,
    points: [
      "Nada é substituído",
      "Aprovação por e-mail",
      "Conciliação sem digitar",
    ],
  },
]

export function ErpFitSection() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.12)

  return (
    <section
      id="encaixe"
      className="px-20 pt-24 pb-20 max-lg:px-10 max-md:px-6 max-md:pt-16 max-md:pb-12 max-sm:px-4"
    >
      <div ref={ref} data-shown={shown} className="mx-auto w-full max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <div data-reveal>
            <SectionLabel>Onde você está</SectionLabel>
          </div>

          <h2
            data-reveal
            className="max-w-[600px] pb-1 text-center text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.06] font-semibold tracking-[-0.01em] text-balance text-transparent"
            style={
              {
                backgroundImage: TITLE_GRADIENT,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                "--reveal-delay": "90ms",
              } as React.CSSProperties
            }
          >
            Tem lugar pro AprovAI com ou sem ERP.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 max-lg:mt-10 max-lg:gap-5 max-md:grid-cols-1">
          {SCENARIOS.map((scenario, index) => (
            <ScenarioCard key={scenario.id} index={index} {...scenario} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ScenarioCard({
  index,
  chip,
  title,
  mockup,
  points,
}: (typeof SCENARIOS)[number] & { index: number }) {
  return (
    <article
      data-reveal
      className="flex flex-col rounded-[24px] border border-border bg-card p-8 shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_16px_40px_-24px_oklch(0.2_0_0/0.16)] max-md:p-6"
      style={{ "--reveal-delay": `${240 + index * 90}ms` } as React.CSSProperties}
    >
      <span className="w-fit rounded-lg bg-muted px-2.5 py-1 text-[12px] leading-[18px] font-semibold text-muted-foreground">
        {chip}
      </span>

      <div className="mt-7">{mockup}</div>

      <h3 className="mt-8 text-[21px] leading-7 font-semibold text-foreground">
        {title}
      </h3>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-center gap-2">
            <span className="grid size-[18px] shrink-0 place-items-center rounded-full bg-brand-accent/12 text-brand-accent-strong">
              <ApprovalMark className="size-2.5" />
            </span>
            <span className="text-[14px] leading-5 text-foreground/75">
              {point}
            </span>
          </li>
        ))}
      </ul>
    </article>
  )
}
