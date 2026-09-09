import { ApprovalMark } from "@/components/shared/approval-mark"
import { SectionLabel } from "@/features/marketing/section-label"
import { useReveal } from "@/hooks/use-reveal"
import { cn } from "@/lib/utils"

const TITLE_GRADIENT =
  "linear-gradient(91deg, var(--foreground) 43%, color-mix(in oklab, var(--foreground) 44%, oklch(1 0 0)) 100%)"

// Os valores ainda não estão fechados. Enquanto isso, os planos vivem
// direto aqui na LP (sem depender da API), mostrando nome, limites e
// recursos de cada um, mas nunca o preço.
type Plan = {
  id: string
  name: string
  pitch: string
  featured?: boolean
  limits: string[]
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: "essencial",
    name: "Essencial",
    pitch: "Pra quem está saindo do WhatsApp",
    limits: ["100 pedidos por mês", "10 pessoas na equipe"],
    features: [],
  },
  {
    id: "profissional",
    name: "Profissional",
    pitch: "Pra operação que já roda todo mês",
    featured: true,
    limits: ["1.000 pedidos por mês", "50 pessoas na equipe"],
    features: ["Extração assistida por IA", "Aprovação por e-mail"],
  },
  {
    id: "corporativo",
    name: "Corporativo",
    pitch: "Pra quem tem várias frentes de compra",
    limits: ["Pedidos sem limite", "Equipe sem limite"],
    features: [
      "Extração assistida por IA",
      "Aprovação por e-mail",
      "Relatórios avançados",
    ],
  },
]

export function PlansSection() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.12)

  return (
    <section
      id="precos"
      className="px-20 pt-24 pb-20 max-lg:px-10 max-md:px-6 max-md:pt-16 max-md:pb-12 max-sm:px-4"
    >
      <div ref={ref} data-shown={shown} className="mx-auto w-full max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <div data-reveal>
            <SectionLabel>Planos</SectionLabel>
          </div>

          <h2
            data-reveal
            className="max-w-[560px] pb-1 text-center text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.06] font-semibold tracking-[-0.01em] text-balance text-transparent"
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
            Três planos. Você escolhe quando entrar.
          </h2>

          <p
            data-reveal
            className="max-w-[560px] text-center text-[18px] leading-7 text-balance text-muted-foreground"
            style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
          >
            Ninguém escolhe plano antes de ver o produto rodando. Entre na
            lista, monte a primeira alçada, e a conversa de preço vem depois.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 max-lg:mt-10 max-lg:grid-cols-1 max-lg:gap-5">
          {PLANS.map((plan, index) => (
            <PlanCard key={plan.id} index={index} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PlanCard({ index, plan }: { index: number; plan: Plan }) {
  return (
    <article
      data-reveal
      className={cn(
        "flex flex-col rounded-[24px] border bg-card p-8 max-md:p-6",
        plan.featured
          ? "border-primary/25 shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_20px_48px_-24px_oklch(0.2_0_0/0.22)]"
          : "border-border shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_16px_40px_-24px_oklch(0.2_0_0/0.14)]",
      )}
      style={{ "--reveal-delay": `${260 + index * 80}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[19px] leading-6 font-semibold text-foreground">
          {plan.name}
        </h3>
        {plan.featured ? (
          <span className="rounded-lg bg-primary/8 px-2 py-1 text-[11px] leading-4 font-semibold whitespace-nowrap text-primary">
            Mais escolhido
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
        {plan.pitch}
      </p>

      <p className="mt-6 flex items-center gap-2">
        <span className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-foreground/40">
          R$ ···
        </span>
        <span className="rounded-md bg-muted px-2 py-1 text-[11.5px] leading-4 font-semibold whitespace-nowrap text-muted-foreground">
          valor sai com a abertura
        </span>
      </p>

      <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-border/70 pt-6">
        {plan.limits.map((limit) => (
          <PlanItem key={limit}>{limit}</PlanItem>
        ))}
        {plan.features.map((feature) => (
          <PlanItem key={feature}>{feature}</PlanItem>
        ))}
      </ul>

      <a
        href="#lista"
        className={cn(
          "mt-8 flex h-11 items-center justify-center rounded-[12px] text-[14px] leading-5 font-semibold transition-colors duration-150 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          plan.featured
            ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.16),0_2px_4px_oklch(0.2_0_0/0.12)] hover:bg-primary-hover"
            : "border border-border bg-card text-foreground shadow-[0_2px_4px_oklch(0.2_0_0/0.04)] hover:bg-muted",
        )}
      >
        Entrar na lista
      </a>
    </article>
  )
}

function PlanItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full bg-brand-accent/12 text-brand-accent-strong">
        <ApprovalMark className="size-2.5" />
      </span>
      <span className="text-[14.5px] leading-6 text-foreground/80">
        {children}
      </span>
    </li>
  )
}
