import { useState } from "react"
import { Plus } from "@phosphor-icons/react"

import { SectionLabel } from "@/features/marketing/section-label"
import { useReveal } from "@/hooks/use-reveal"
import { cn } from "@/lib/utils"

const TITLE_GRADIENT =
  "linear-gradient(91deg, var(--foreground) 43%, color-mix(in oklab, var(--foreground) 44%, oklch(1 0 0)) 100%)"

const QUESTIONS = [
  {
    q: "Preciso trocar o meu ERP?",
    a: "Não. Ele continua com contabilidade, fiscal e folha. O AprovAI cuida do caminho do pedido até o pagamento e devolve os dados em CSV ou XLSX pra você conciliar no que já usa.",
  },
  {
    q: "Quem aprova precisa aprender a usar o sistema?",
    a: "Não. O aprovador recebe o pedido por e-mail com valor, centro de custo e saldo do orçamento, e decide no próprio e-mail. O link é de uso único e expira em sete dias.",
  },
  {
    q: "E quando o gestor está de férias?",
    a: "Ele configura um substituto com data de início e fim. Tudo que chegaria pra ele vai pro substituto no período, e a trilha registra que a decisão foi tomada em nome dele.",
  },
  {
    q: "A IA decide alguma coisa sozinha?",
    a: "Não. Ela lê o anexo e preenche campos que continuam editáveis, e nada é enviado sem alguém confirmar. A rota de aprovação é calculada por algoritmo determinístico, não por inferência.",
  },
  {
    q: "Consigo mudar uma faixa de alçada sem abrir chamado?",
    a: "Sim. O admin financeiro edita as faixas na tela, e existe um simulador que mostra qual rota um pedido tomaria antes de você salvar a mudança.",
  },
  {
    q: "O que acontece se o centro de custo estourar o orçamento?",
    a: "O gestor e o financeiro são avisados quando o consumo chega a 80% e a 100% do período. E quem aprova vê o saldo que sobra na mesma tela onde decide.",
  },
  {
    q: "Meus dados ficam presos se eu quiser sair?",
    a: "Não. A exportação está disponível a qualquer momento, e continua disponível mesmo sem assinatura ativa. O histórico é seu.",
  },
]

const INDEXED = QUESTIONS.map((item, index) => ({ ...item, index }))
const SPLIT = Math.ceil(INDEXED.length / 2)
const COLUMNS = [INDEXED.slice(0, SPLIT), INDEXED.slice(SPLIT)]

export function FaqSection() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.12)
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section
      id="faq"
      className="px-20 pt-24 pb-20 max-lg:px-10 max-md:px-6 max-md:pt-16 max-md:pb-12 max-sm:px-4"
    >
      <div ref={ref} data-shown={shown} className="mx-auto w-full max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <div data-reveal>
            <SectionLabel>Perguntas</SectionLabel>
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
            O que perguntam antes de assinar.
          </h2>
        </div>

        <div className="mx-auto mt-14 flex max-w-[1100px] items-start gap-6 max-lg:mt-10 max-lg:max-w-[720px] max-lg:flex-col max-lg:gap-3">
          {COLUMNS.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className="flex flex-1 flex-col gap-3 max-lg:w-full"
            >
              {column.map((item) => (
                <FaqItem
                  key={item.q}
                  index={item.index}
                  isOpen={open === item.index}
                  onToggle={() => setOpen(open === item.index ? null : item.index)}
                  q={item.q}
                  a={item.a}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({
  index,
  q,
  a,
  isOpen,
  onToggle,
}: {
  index: number
  q: string
  a: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      data-reveal
      className={cn(
        "overflow-hidden rounded-[18px] border bg-card transition-colors duration-200 ease-out",
        isOpen ? "border-primary/25" : "border-border"
      )}
      style={{ "--reveal-delay": `${200 + index * 55}ms` } as React.CSSProperties}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center gap-4 px-6 py-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-md:px-5"
      >
        <span className="flex-1 text-[15.5px] leading-6 font-medium text-foreground">
          {q}
        </span>
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen
              ? "rotate-45 border-primary/25 bg-primary/8 text-primary"
              : "border-border bg-card text-muted-foreground"
          )}
        >
          <Plus size={13} weight="bold" />
        </span>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="px-6 pb-5 text-[14.5px] leading-6 text-muted-foreground max-md:px-5">
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}
