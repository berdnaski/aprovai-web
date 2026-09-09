import type { PublicPlan } from "@/api/marketing"
import { ApprovalMark } from "@/components/shared/approval-mark"
import { Skeleton } from "@/components/ui/skeleton"
import { SectionLabel } from "@/features/marketing/section-label"
import { usePublicPlans } from "@/hooks/marketing/use-marketing"
import { useReveal } from "@/hooks/use-reveal"
import { cn } from "@/lib/utils"

const TITLE_GRADIENT =
  "linear-gradient(91deg, var(--foreground) 43%, color-mix(in oklab, var(--foreground) 44%, oklch(1 0 0)) 100%)"

const SHOW_LIVE_PLANS = true

const TIER_PITCH: Record<string, string> = {
  BASIC: "Pra quem está saindo do WhatsApp",
  PROFESSIONAL: "Pra operação que já roda todo mês",
  ENTERPRISE: "Pra quem tem várias frentes de compra",
}

const FEATURE_LABELS: Record<string, string> = {
  "ai-extraction": "Extração assistida por IA",
  "email-approval": "Aprovação por e-mail",
  "advanced-reports": "Relatórios avançados",
}

function limitLabel(
  value: number | null,
  counted: string,
  unlimited: string,
): string {
  return value === null
    ? unlimited
    : `${new Intl.NumberFormat("pt-BR").format(value)} ${counted}`
}

export function PlansSection() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.12)
  const plans = usePublicPlans(SHOW_LIVE_PLANS)

  const items = SHOW_LIVE_PLANS ? (plans.data ?? []) : []
  const isPending = SHOW_LIVE_PLANS && plans.isPending

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

        <div className="mt-14 max-lg:mt-10">
          {isPending ? <PlansSkeleton /> : null}

          {!isPending && items.length > 0 ? (
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1 max-lg:gap-5">
              {items.map((plan, index) => (
                <PlanCard key={plan.id} index={index} plan={plan} />
              ))}
            </div>
          ) : null}

          {!isPending && items.length === 0 ? <PlansFallback /> : null}
        </div>
      </div>
    </section>
  )
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1 max-lg:gap-5">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="flex flex-col rounded-[24px] border border-border bg-card p-8 max-md:p-6"
        >
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-3 h-5 w-48" />
          <Skeleton className="mt-6 h-9 w-40" />
          <div className="mt-7 flex flex-col gap-3 border-t border-border/70 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
          <Skeleton className="mt-8 h-11 w-full rounded-[12px]" />
        </div>
      ))}
    </div>
  )
}

function PlansFallback() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center rounded-[24px] border border-border bg-card p-10 text-center shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_16px_40px_-24px_oklch(0.2_0_0/0.14)] max-md:p-8">
      <h3 className="text-[19px] leading-6 font-semibold text-foreground">
        A tabela de planos sai junto com a abertura
      </h3>
      <p className="mt-3 text-[15px] leading-6 text-muted-foreground">
        Estamos fechando os limites de cada plano com as primeiras empresas da
        lista. Entre nela e você recebe os valores antes de todo mundo.
      </p>
      <a
        href="#lista"
        className="mt-7 inline-flex h-11 items-center justify-center rounded-[12px] bg-primary px-5 text-[14px] leading-5 font-semibold text-primary-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.16),0_2px_4px_oklch(0.2_0_0/0.12)] transition-colors duration-150 ease-out outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Entrar na lista
      </a>
    </div>
  )
}

function PlanCard({ index, plan }: { index: number; plan: PublicPlan }) {
  const featured = plan.tier === "PROFESSIONAL"

  return (
    <article
      data-reveal
      className={cn(
        "flex flex-col rounded-[24px] border bg-card p-8 max-md:p-6",
        featured
          ? "border-primary/25 shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_20px_48px_-24px_oklch(0.2_0_0/0.22)]"
          : "border-border shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_16px_40px_-24px_oklch(0.2_0_0/0.14)]",
      )}
      style={{ "--reveal-delay": `${260 + index * 80}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[19px] leading-6 font-semibold text-foreground">
          {plan.name}
        </h3>
        {featured ? (
          <span className="rounded-lg bg-primary/8 px-2 py-1 text-[11px] leading-4 font-semibold whitespace-nowrap text-primary">
            Mais escolhido
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
        {TIER_PITCH[plan.tier] ?? "Pra quem quer tirar a compra do improviso"}
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
        <PlanItem>
          {limitLabel(plan.maxRequestsMonth, "pedidos por mês", "Pedidos sem limite")}
        </PlanItem>
        <PlanItem>
          {limitLabel(plan.maxMembers, "pessoas na equipe", "Equipe sem limite")}
        </PlanItem>
        {plan.features.map((feature) => (
          <PlanItem key={feature}>
            {FEATURE_LABELS[feature] ?? feature}
          </PlanItem>
        ))}
      </ul>

      <a
        href="#lista"
        className={cn(
          "mt-8 flex h-11 items-center justify-center rounded-[12px] text-[14px] leading-5 font-semibold transition-colors duration-150 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          featured
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
