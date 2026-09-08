import {
  ApprovalMockup,
  RequestMockup,
  RulesMockup,
} from "@/features/marketing/audience-mockups"
import { SectionLabel } from "@/features/marketing/section-label"
import { useReveal } from "@/hooks/use-reveal"

const TITLE_GRADIENT =
  "linear-gradient(91deg, var(--foreground) 43%, color-mix(in oklab, var(--foreground) 44%, oklch(1 0 0)) 100%)"

const AUDIENCES = [
  {
    title: "Quem pede",
    description:
      "Você anexa a proposta e o resto já vem preenchido. Não precisa descobrir qual é a alçada, em que centro de custo aquilo cai, nem quem tem que aprovar.",
    mockup: <RequestMockup />,
  },
  {
    title: "Quem aprova",
    description:
      "Chega um e-mail com o valor, a área que está pedindo e quanto ainda sobra no orçamento. Você responde ali mesmo, do celular, no meio da reunião.",
    mockup: <ApprovalMockup />,
  },
  {
    title: "Quem controla",
    description:
      "Você define as faixas de valor e o orçamento de cada área uma vez só. Mudou um limite, trocou um aprovador? Leva minutos e não depende de ninguém de fora.",
    mockup: <RulesMockup />,
  },
]

export function AudienceSection() {
  return (
    <section
      id="produto"
      className="px-20 pt-24 pb-20 max-lg:px-10 max-md:px-6 max-md:pt-16 max-md:pb-12 max-sm:px-4"
    >
      <div className="mx-auto w-full max-w-[1430px]">
        <SectionHeading />

        <div className="mt-16 grid grid-cols-3 gap-6 max-lg:mt-12 max-lg:gap-5 max-md:grid-cols-1">
          {AUDIENCES.map((audience, index) => (
            <AudienceCard key={audience.title} index={index} {...audience} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionHeading() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.4)

  return (
    <div
      ref={ref}
      data-shown={shown}
      className="flex flex-col items-center gap-6"
    >
      <div data-reveal>
        <SectionLabel>Quem usa</SectionLabel>
      </div>

      <h2
        data-reveal
        className="max-w-[640px] pb-1 text-center text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.06] font-semibold tracking-[-0.01em] text-balance text-transparent"
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
        Toda compra passa por três pessoas.
      </h2>

      <p
        data-reveal
        className="max-w-[620px] text-center text-[18px] leading-7 text-balance text-muted-foreground"
        style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
      >
        Quem pede manda a proposta e pronto. Quem aprova decide pelo{" "}

        <span className="whitespace-nowrap">e-mail</span>. Quem controla
        escreve a regra uma vez e vai cuidar de outra coisa.
      </p>
    </div>
  )
}

function AudienceCard({
  index,
  title,
  description,
  mockup,
}: (typeof AUDIENCES)[number] & { index: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>(0.2)

  return (
    <div
      ref={ref}
      data-shown={shown}

      className="group/col flex flex-col items-center gap-8 rounded-[24px] border border-border bg-card px-7 pt-10 pb-11 shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_16px_40px_-24px_oklch(0.2_0_0/0.16)] max-md:gap-6 max-md:px-6 max-md:pt-8 max-md:pb-9"

      style={{ "--col-delay": `${index * 90}ms` } as React.CSSProperties}
    >

      {mockup}

      <div
        data-reveal
        className="flex w-full flex-col items-center gap-3 text-center"
        style={
          {
            "--reveal-delay": "calc(var(--col-delay, 0ms) + 460ms)",
          } as React.CSSProperties
        }
      >
        <h3 className="text-[19px] leading-6 font-semibold text-foreground">
          {title}
        </h3>

        <p className="text-[16px] leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
