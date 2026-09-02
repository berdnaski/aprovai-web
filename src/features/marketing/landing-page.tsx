import { ArrowRight, Check, PlayCircle } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { BentoCard } from "./components/bento-card"
import { FaqItem } from "./components/faq-item"
import { HeroFrame } from "./components/hero-frame"
import {
  BudgetMeter,
  EmailDecision,
  EscalationTimer,
  MatchColumns,
  TierLadder,
} from "./components/mini-visuals"

const NAV_LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#precos", label: "Preços" },
  { href: "#limites", label: "Limites" },
]

const PROOF = [
  { figure: "3", label: "vias conferidas antes de pagar" },
  { figure: "1 clique", label: "para decidir, direto do e-mail" },
  { figure: "0", label: "registros editáveis na trilha" },
]

const PLANS = [
  {
    name: "Essencial",
    price: "1.200",
    requests: "100 pedidos por mês",
    perks: ["Usuários ilimitados", "Matriz de alçadas", "Aprovação por e-mail"],
    highlight: false,
  },
  {
    name: "Crescimento",
    price: "2.200",
    requests: "300 pedidos por mês",
    perks: [
      "Tudo do Essencial",
      "Conferência de nota fiscal",
      "Extração de orçamento por IA",
    ],
    highlight: true,
  },
  {
    name: "Escala",
    price: "3.800",
    requests: "800 pedidos por mês",
    perks: ["Tudo do Crescimento", "Relatórios e indicadores", "Suporte direto"],
    highlight: false,
  },
]

const TRAIL = [
  {
    what: "Aprovou REQ-2026-0042",
    who: "Carla Mendes · Diretora Financeira",
    when: "02/09 · 14:12",
    tone: "ok" as const,
  },
  {
    what: "Escalou por prazo de 72h úteis",
    who: "Sistema · sem intervenção humana",
    when: "01/09 · 09:00",
    tone: "warn" as const,
  },
  {
    what: "Liberou exceção na conferência",
    who: "Fernanda Alves · justificou por escrito",
    when: "28/08 · 17:45",
    tone: "warn" as const,
  },
  {
    what: "Enviou para aprovação",
    who: "Ana Souza · Comercial",
    when: "28/08 · 10:03",
    tone: "ok" as const,
  },
]

function Wrap({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1160px] px-6", className)}>
      {children}
    </div>
  )
}

function SectionHead({
  label,
  lead,
  muted,
  center = true,
}: {
  label: string
  lead: string
  muted: string
  center?: boolean
}) {
  return (
    <div
      className={cn(
        "mb-14 flex max-w-[44rem] flex-col",
        center && "mx-auto items-center text-center",
      )}
    >
      <p className="mb-4 text-overline text-primary">{label}</p>
      <h2 className="text-[clamp(1.8rem,4.2vw,2.6rem)] leading-[1.1] font-bold tracking-[-0.032em] text-balance text-foreground">
        {lead}
      </h2>
      <p className="mt-4 text-subhead leading-relaxed text-muted-foreground">
        {muted}
      </p>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <Wrap className="flex h-16 items-center gap-8">
          <span className="text-heading tracking-tight text-foreground">
            AprovAI
          </span>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link to="/entrar" />}
              className="h-9 font-medium text-muted-foreground hover:text-foreground"
            >
              Entrar
            </Button>

            <Button
              nativeButton={false}
              render={<a href="#contato" />}
              className="h-9 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Agendar demonstração
            </Button>
          </div>
        </Wrap>
      </header>

      <main>
        <section className="relative overflow-hidden pb-24">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[720px] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
          />

          <Wrap className="relative pt-20 sm:pt-28">
            <div className="mx-auto flex max-w-[48rem] flex-col items-center text-center">
              <span className="mb-8 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-caption text-muted-foreground shadow-xs">
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-brand-accent"
                />
                Conferência de nota fiscal já disponível
              </span>

              <h1 className="text-[clamp(2.5rem,6.6vw,4.4rem)] leading-[1.02] font-bold tracking-[-0.042em] text-balance">
                <span className="block text-foreground">
                  Aprovação de compras
                </span>
                <span className="block text-muted-foreground/70">
                  que não depende de ninguém lembrar
                </span>
              </h1>

              <p className="mt-7 max-w-[40rem] text-[clamp(1.02rem,2.1vw,1.2rem)] leading-relaxed text-muted-foreground">
                O pedido vai para a alçada certa sozinho, cobra quem está
                travando a fila, e o pagamento só sai quando a nota bate com o
                que foi combinado.
              </p>

              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<a href="#contato" />}
                  className="h-12 gap-2 bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  Agendar demonstração
                  <ArrowRight size={15} weight="bold" aria-hidden />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={<a href="#produto" />}
                  className="h-12 gap-2 bg-card px-6 font-medium"
                >
                  <PlayCircle size={16} aria-hidden />
                  Ver o produto
                </Button>
              </div>

              <p className="mt-5 text-caption text-muted-foreground">
                A partir de R$ 1.200/mês · usuários ilimitados · piloto de 90
                dias
              </p>
            </div>

            <div className="mt-20 sm:mt-24">
              <HeroFrame />
            </div>
          </Wrap>
        </section>

        <section className="border-y border-border bg-card/60">
          <Wrap className="grid gap-8 py-10 sm:grid-cols-3">
            {PROOF.map((item) => (
              <div key={item.label} className="flex items-baseline gap-3">
                <span className="text-heading tabular-nums text-foreground">
                  {item.figure}
                </span>
                <span className="text-caption leading-relaxed text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </Wrap>
        </section>

        <section id="produto" className="py-24">
          <Wrap>
            <SectionHead
              label="O que o sistema faz sozinho"
              lead="Quatro decisões que ninguém precisa lembrar de tomar"
              muted="Cada uma delas é uma regra escrita uma vez e aplicada sempre igual, com registro."
            />

            <div className="grid gap-5 lg:grid-cols-6">
              <BentoCard
                className="lg:col-span-3"
                eyebrow="Matriz de alçadas"
                title="O valor escolhe o aprovador, não a pessoa que lembrou"
                body="Faixas por centro de custo e categoria. Passou do teto do gerente, sobe sozinho. Ninguém aprova o próprio pedido."
                visual={<TierLadder />}
              />

              <BentoCard
                className="lg:col-span-3"
                eyebrow="Aprovação por e-mail"
                title="Decide do celular, sem abrir o sistema"
                body="O aprovador recebe o resumo e dois botões. O link é de uso único e expira, e a decisão entra na trilha igual."
                visual={<EmailDecision />}
              />

              <BentoCard
                className="lg:col-span-2"
                eyebrow="Orçamento"
                title="O saldo aparece antes do aceite"
                body="Quem pede vê quanto sobra no centro de custo enquanto ainda dá para mudar."
                visual={<BudgetMeter />}
              />

              <BentoCard
                className="lg:col-span-2"
                eyebrow="Prazo"
                title="A fila cobra sozinha"
                body="Passou do prazo, o sistema escala para o superior sem ninguém precisar cutucar."
                visual={<EscalationTimer />}
              />

              <BentoCard
                className="lg:col-span-2"
                eyebrow="Conferência"
                title="A nota trava o pagamento"
                body="Pedido, recebimento e nota comparados. Divergiu, alguém precisa assumir por escrito."
                visual={<MatchColumns />}
              />
            </div>
          </Wrap>
        </section>

        <section className="bg-ink py-24 text-ink-foreground">
          <Wrap>
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
              <div>
                <p className="mb-4 text-overline text-ink-muted">
                  A prova, não a promessa
                </p>
                <h2 className="mb-6 text-[clamp(1.8rem,4.2vw,2.6rem)] leading-[1.1] font-bold tracking-[-0.032em] text-balance text-ink-foreground">
                  A trilha que ninguém edita, nem o administrador
                </h2>
                <p className="mb-5 max-w-[38rem] text-subhead leading-relaxed text-ink-muted">
                  Cada decisão grava quem foi, quando, por qual regra e sobre
                  qual valor. Não existe rota de alteração nem de remoção no
                  sistema, para nenhum perfil.
                </p>
                <p className="max-w-[38rem] text-body leading-relaxed text-ink-muted">
                  É essa a resposta para a pergunta que o controller mais teme
                  ouvir do auditor.
                </p>
              </div>

              <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-ink-border bg-ink-border">
                {TRAIL.map((row) => (
                  <div
                    key={row.what}
                    className="flex items-center gap-3.5 bg-ink-2 px-5 py-4"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        row.tone === "ok" ? "bg-brand-accent" : "bg-warning",
                      )}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-caption text-ink-foreground">
                        {row.what}
                      </span>
                      <span className="truncate text-micro text-ink-muted">
                        {row.who}
                      </span>
                    </span>
                    <span className="shrink-0 text-micro tabular-nums text-ink-muted">
                      {row.when}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Wrap>
        </section>

        <section id="precos" className="py-24">
          <Wrap>
            <SectionHead
              label="Preços"
              lead="Você paga pelo volume de compras, não por cabeça"
              muted="Cobrar por usuário faria você economizar aprovador — e aprovador de menos é exatamente o que quebra o controle."
            />

            <div className="grid gap-5 md:grid-cols-3">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={cn(
                    "flex flex-col gap-5 rounded-2xl border bg-card p-7",
                    plan.highlight
                      ? "border-primary/30 shadow-[0_2px_8px_oklch(0.2_0_0/0.04),0_16px_40px_oklch(0.44_0.17_305/0.12)]"
                      : "border-border shadow-xs",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-label text-foreground">{plan.name}</h3>
                    {plan.highlight ? (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-micro font-medium text-primary">
                        Mais escolhido
                      </span>
                    ) : null}
                  </div>

                  <p className="flex items-baseline gap-1">
                    <span className="text-subhead text-muted-foreground">
                      R$
                    </span>
                    <span className="text-display tabular-nums text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      /mês
                    </span>
                  </p>

                  <p className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-caption font-medium text-foreground">
                    {plan.requests}
                  </p>

                  <ul className="flex flex-col gap-2.5">
                    {plan.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-2 text-caption text-muted-foreground"
                      >
                        <Check
                          size={13}
                          weight="bold"
                          aria-hidden
                          className="mt-1 shrink-0 text-brand-accent-strong"
                        />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <Button
                    nativeButton={false}
                    render={<a href="#contato" />}
                    variant={plan.highlight ? "default" : "outline"}
                    className={cn(
                      "mt-auto h-10 w-full font-medium",
                      plan.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                        : "bg-card",
                    )}
                  >
                    Falar sobre este plano
                  </Button>
                </article>
              ))}
            </div>

            <p className="mx-auto mt-7 max-w-[54ch] text-center text-caption leading-relaxed text-muted-foreground">
              Piloto de 90 dias, cancela quando quiser, sem multa. Estourou a
              faixa de pedidos, sobe de plano no mês seguinte — avisado, nunca
              por surpresa.
            </p>
          </Wrap>
        </section>

        <section id="limites" className="border-t border-border py-24">
          <Wrap>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
              <div>
                <p className="mb-4 text-overline text-primary">
                  Antes de marcar
                </p>
                <h2 className="mb-5 text-[clamp(1.8rem,4.2vw,2.6rem)] leading-[1.1] font-bold tracking-[-0.032em] text-balance text-foreground">
                  O que o AprovAI não faz
                </h2>
                <p className="text-subhead leading-relaxed text-muted-foreground">
                  Se algum destes for essencial hoje, é melhor você saber agora
                  do que na terceira reunião.
                </p>
              </div>

              <div className="border-t border-border">
                <FaqItem question="Funciona com nota de serviço?">
                  <p>
                    Ainda não. A conferência automática lê NF-e de produto,
                    modelo 55. Serviço, frete e assinatura de software seguem por
                    uma liberação manual com comprovante anexado, que fica
                    registrada igual.
                  </p>
                  <p>
                    Se a maior parte das suas compras for serviço, o ganho aqui é
                    menor.
                  </p>
                </FaqItem>

                <FaqItem question="O sistema emite nota fiscal?">
                  <p>
                    Não, e não deve. Quem emite é o fornecedor. O AprovAI recebe
                    o XML e confere contra o que foi pedido e recebido. A guarda
                    fiscal continua com a sua contabilidade.
                  </p>
                </FaqItem>

                <FaqItem question="Vocês consultam a SEFAZ?">
                  <p>
                    Não. Validamos o protocolo de autorização que vem dentro do
                    próprio XML, e recusamos nota de homologação ou rejeitada. Um
                    cancelamento feito depois da autorização não aparece aqui.
                  </p>
                </FaqItem>

                <FaqItem question="Minha empresa tem filiais com CNPJs diferentes.">
                  <p>
                    Hoje cada CNPJ é uma conta separada, sem visão consolidada
                    entre elas. Se isso for necessário desde o início, me diga na
                    primeira conversa.
                  </p>
                </FaqItem>

                <FaqItem question="Substitui meu ERP?">
                  <p>
                    Não. O AprovAI cuida do que acontece antes do pagamento: quem
                    pediu, quem aprovou, o que chegou e se a nota bate.
                    Contabilidade, fiscal e tesouraria continuam onde estão.
                  </p>
                </FaqItem>
              </div>
            </div>
          </Wrap>
        </section>

        <section id="contato" className="pb-24">
          <Wrap>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-ink px-8 py-16 text-center sm:px-16">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--ink-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--ink-border)_1px,transparent_1px)] [background-size:48px_48px] opacity-50 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,black,transparent)]"
              />

              <div className="relative mx-auto flex max-w-[38rem] flex-col items-center">
                <h2 className="text-[clamp(1.7rem,4vw,2.4rem)] leading-tight font-bold tracking-[-0.032em] text-balance text-ink-foreground">
                  Vinte minutos, com o seu processo na tela
                </h2>

                <p className="mt-5 text-subhead leading-relaxed text-ink-muted">
                  Você conta como as compras são aprovadas hoje, eu mostro como
                  ficaria. Se não fizer sentido, a gente encerra em dez.
                </p>

                <Button
                  size="lg"
                  nativeButton={false}
                  render={
                    <a href="mailto:contato@aprovai.com.br?subject=Demonstra%C3%A7%C3%A3o%20do%20AprovAI" />
                  }
                  className="mt-9 h-12 gap-2 bg-primary px-7 font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  Marcar a demonstração
                  <ArrowRight size={15} weight="bold" aria-hidden />
                </Button>

                <p className="mt-5 text-caption text-ink-muted">
                  Sem apresentação de slides. Você fala com quem construiu.
                </p>
              </div>
            </div>
          </Wrap>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <Wrap className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-label text-foreground">AprovAI</span>
          <span className="text-caption text-muted-foreground">
            Aprovação de compras e conferência de notas
          </span>
          <a
            href="mailto:contato@aprovai.com.br"
            className="ml-auto rounded-md text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            contato@aprovai.com.br
          </a>
        </Wrap>
      </footer>
    </div>
  )
}
