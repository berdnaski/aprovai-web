import { useState } from "react"
import { ArrowsLeftRight, TreeStructure } from "@phosphor-icons/react"

import { ApprovalMark } from "@/components/shared/approval-mark"
import {
  ApprovalFlowMockup,
  FinanceFlowMockup,
} from "@/features/marketing/solution-mockups"
import { SectionLabel } from "@/features/marketing/section-label"
import { useReveal } from "@/hooks/use-reveal"
import { cn } from "@/lib/utils"

const TITLE_GRADIENT =
  "linear-gradient(91deg, var(--foreground) 43%, color-mix(in oklab, var(--foreground) 44%, oklch(1 0 0)) 100%)"

const TABS = [
  {
    id: "aprovacao",
    label: "Aprovação",
    icon: TreeStructure,
    title: "Antes de gastar",
    description:
      "O pedido entra, acha sozinho a rota que a sua matriz de alçadas manda, e cai na mão de quem pode decidir.",
    bullets: [
      "Pedido pronto em um minuto",
      "Rota escolhida pelo valor",
      "Saldo do orçamento na hora",
      "Cobrança de quem está devendo",
    ],
    mockup: <ApprovalFlowMockup />,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: ArrowsLeftRight,
    title: "Depois de gastar",
    description:
      "A ordem sai sozinha, a nota é conferida contra o pedido, e só então vira conta a pagar. Divergência aparece antes do dinheiro sair.",
    bullets: [
      "Ordem emitida na aprovação",
      "Nota conferida com o pedido",
      "CNPJ checado na Receita",
      "Conta a pagar em um clique",
    ],
    mockup: <FinanceFlowMockup />,
  },
]

export function SolutionSection() {
  const [active, setActive] = useState(0)
  const { ref, shown } = useReveal<HTMLDivElement>(0.15)

  return (
    <section
      id="alcadas"
      className="px-20 pt-24 pb-20 max-lg:px-10 max-md:px-6 max-md:pt-16 max-md:pb-12 max-sm:px-4"
    >
      <div ref={ref} data-shown={shown} className="mx-auto w-full max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <div data-reveal>
            <SectionLabel>Como funciona</SectionLabel>
          </div>

          <h2
            data-reveal
            className="max-w-[470px] pb-1 text-center text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.06] font-semibold tracking-[-0.01em] text-balance text-transparent"
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
            Toda compra tem um antes e um depois.
          </h2>

          <p
            data-reveal
            className="max-w-[620px] text-center text-[18px] leading-7 text-balance text-muted-foreground"
            style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
          >
            Antes, alguém precisa dizer que pode. Depois, alguém precisa
            conferir se veio o que foi combinado. O AprovAI cuida das duas
            pontas.
          </p>
        </div>

        <div
          data-reveal
          className="relative mt-16 flex flex-col max-lg:mt-12"
          style={{ "--reveal-delay": "280ms" } as React.CSSProperties}
        >
          <div className="relative overflow-hidden rounded-[24px] border border-border bg-muted/80 pt-[68px] max-md:pt-4">
            <TabPanels active={active} />
          </div>

          <TabNotch active={active} onChange={setActive} />
        </div>
      </div>
    </section>
  )
}

function TabNotch({
  active,
  onChange,
}: {
  active: number
  onChange: (index: number) => void
}) {
  return (
    <div className="absolute top-0 left-1/2 z-10 flex -translate-x-1/2 items-start max-md:static max-md:order-first max-md:mb-4 max-md:translate-x-0 max-md:justify-center">
      <span
        aria-hidden
        className="h-5 w-5 bg-background max-md:hidden"
        style={{
          maskImage: "radial-gradient(20px at 0 100%, #0000 98%, #000)",
          WebkitMaskImage: "radial-gradient(20px at 0 100%, #0000 98%, #000)",
        }}
      />

      <div className="flex h-[68px] w-[392px] items-center justify-center rounded-b-[20px] bg-background max-md:h-auto max-md:w-full max-md:rounded-none max-md:bg-transparent">
        <TabSwitch active={active} onChange={onChange} />
      </div>

      <span
        aria-hidden
        className="h-5 w-5 bg-background max-md:hidden"
        style={{
          maskImage: "radial-gradient(20px at 100% 100%, #0000 98%, #000)",
          WebkitMaskImage: "radial-gradient(20px at 100% 100%, #0000 98%, #000)",
        }}
      />
    </div>
  )
}

function TabSwitch({
  active,
  onChange,
}: {
  active: number
  onChange: (index: number) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Metades de uma compra"
      className="relative flex h-10 w-[360px] items-stretch gap-0.5 rounded-xl border border-border bg-muted/70 p-0.5 max-sm:w-full"
    >
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-0.25rem)] rounded-[10px] border border-border bg-card shadow-[0_2px_4px_oklch(0.2_0_0/0.04)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(${active * 100}%)` }}
      />

      {TABS.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === index}
          aria-controls={`painel-${tab.id}`}
          onClick={() => onChange(index)}
          className={cn(
            "relative z-10 flex-1 cursor-pointer rounded-[10px] text-[14px] leading-5 font-medium transition-colors duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            active === index ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function TabPanels({ active }: { active: number }) {
  return (
    <div className="relative">
      {TABS.map((tab, index) => {
        const isActive = active === index

        return (
          <div
            key={tab.id}
            id={`painel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            aria-hidden={!isActive}
            className={cn(
              "grid grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-8 px-8 pt-2 pb-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-lg:grid-cols-1 max-md:px-5 max-md:pb-6",
              isActive
                ? "translate-x-0 opacity-100"
                : "pointer-events-none absolute inset-0 translate-x-3 opacity-0"
            )}
          >
            <div className="flex flex-col rounded-[20px] border border-border bg-card p-7 max-md:p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/8 text-primary">
                <tab.icon size={20} />
              </span>

              <h3 className="mt-6 text-[19px] leading-6 font-semibold text-foreground">
                {tab.title}
              </h3>
              <p className="mt-2.5 text-[16px] leading-7 text-muted-foreground">
                {tab.description}
              </p>

              <ul className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-6">
                {tab.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-accent/12 text-brand-accent-strong">
                      <ApprovalMark className="size-2.5" />
                    </span>
                    <span className="text-[14px] leading-5 text-foreground/80">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="max-md:hidden">{tab.mockup}</div>
          </div>
        )
      })}
    </div>
  )
}
