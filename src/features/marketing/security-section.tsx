import type { Icon } from "@phosphor-icons/react"
import {
  Buildings,
  FileLock,
  HardDrives,
  Key,
  LockKey,
  Sparkle,
} from "@phosphor-icons/react"

import { ApprovalMark } from "@/components/shared/approval-mark"
import { SectionLabel } from "@/features/marketing/section-label"
import { useReveal } from "@/hooks/use-reveal"
import { cn } from "@/lib/utils"

const TITLE_GRADIENT =
  "linear-gradient(91deg, var(--foreground) 43%, color-mix(in oklab, var(--foreground) 44%, oklch(1 0 0)) 100%)"

const AUDIT_LOG = [
  { who: "MA", name: "Marina Alves", action: "aprovou o pedido #1042", at: "14:32" },
  { who: "CT", name: "Caio Tavares", action: "alterou a faixa de alçada", at: "11:07" },
  { who: "RN", name: "Rita Nogueira", action: "submeteu o pedido #1041", at: "09:48" },
]

const SMALL_CELLS: Array<{ icon: Icon; title: string; text: string }> = [
  {
    icon: Buildings,
    title: "Uma empresa nunca vê a outra",
    text: "Toda consulta ao banco filtra pelo identificador da organização, sem exceção.",
  },
  {
    icon: Key,
    title: "Senha nunca em texto plano",
    text: "Hash resistente a força bruta, sem criptografia reversível em lugar nenhum.",
  },
  {
    icon: LockKey,
    title: "TLS 1.3 e AES-256",
    text: "Criptografado no caminho e no disco, incluindo dado cadastral de fornecedor.",
  },
  {
    icon: HardDrives,
    title: "Backup diário, 30 dias",
    text: "Rotina automatizada, com procedimento de restauração testado.",
  },
]

export function SecuritySection() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.12)

  return (
    <section
      id="seguranca"
      className="px-20 pt-24 pb-20 max-lg:px-10 max-md:px-6 max-md:pt-16 max-md:pb-12 max-sm:px-4"
    >
      <div ref={ref} data-shown={shown} className="mx-auto w-full max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <div data-reveal>
            <SectionLabel>Segurança</SectionLabel>
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
            Feito pra aguentar auditoria.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-4 gap-4 max-lg:mt-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <AuditCell />
          <AiCell />

          {SMALL_CELLS.map((cell, index) => (
            <SmallCell key={cell.title} index={index} {...cell} />
          ))}
        </div>
      </div>
    </section>
  )
}

const CELL =
  "flex flex-col rounded-[24px] border border-border bg-card p-7 shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_16px_40px_-24px_oklch(0.2_0_0/0.14)] max-md:p-6"

function AuditCell() {
  return (
    <article
      data-reveal
      className={cn(CELL, "col-span-2 max-sm:col-span-1")}
      style={{ "--reveal-delay": "200ms" } as React.CSSProperties}
    >
      <span className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary">
        <FileLock size={19} />
      </span>

      <h3 className="mt-5 text-[19px] leading-6 font-semibold text-foreground">
        Trilha que ninguém apaga
      </h3>
      <p className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
        O histórico é gravado em modo append-only. Nenhum perfil, nem o dono da
        conta, tem rota para editar ou remover um registro.
      </p>

      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-border/70 bg-muted/40 p-2.5">
        {AUDIT_LOG.map((entry) => (
          <div
            key={entry.at}
            className="flex items-center gap-2.5 rounded-xl bg-card px-3 py-2.5"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
              {entry.who}
            </span>
            <span className="min-w-0 flex-1 truncate text-[11.5px] leading-4 text-foreground/80">
              <span className="font-medium text-foreground">{entry.name}</span>{" "}
              {entry.action}
            </span>
            <span className="tabular shrink-0 text-[10.5px] leading-4 text-muted-foreground">
              {entry.at}
            </span>
            <LockKey size={11} className="shrink-0 text-muted-foreground/60" />
          </div>
        ))}
      </div>
    </article>
  )
}

function AiCell() {
  return (
    <article
      data-reveal
      className={cn(CELL, "col-span-2 max-sm:col-span-1")}
      style={{ "--reveal-delay": "280ms" } as React.CSSProperties}
    >
      <span className="grid size-10 place-items-center rounded-xl bg-brand-accent/12 text-brand-accent-strong">
        <Sparkle size={19} weight="fill" />
      </span>

      <h3 className="mt-5 text-[19px] leading-6 font-semibold text-foreground">
        A IA sugere. Quem decide é gente.
      </h3>
      <p className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
        A leitura automática só preenche campo editável, e nada é enviado sem
        confirmação. A rota de aprovação é calculada por algoritmo
        determinístico, não por inferência.
      </p>

      <div className="mt-6 flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-muted/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] leading-4 text-muted-foreground">
            Valor lido da proposta
          </span>
          <span className="tabular text-[11.5px] leading-4 font-medium text-foreground/80">
            R$ 18.864,65
          </span>
        </div>
        <span className="h-px w-full bg-border/70" />
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] leading-4 text-muted-foreground">
            Rota calculada
          </span>
          <span className="flex items-center gap-1.5 rounded-md bg-primary/8 px-1.5 py-0.5 text-[10.5px] leading-4 font-medium text-primary">
            Diretoria
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-brand-accent/25 bg-brand-accent/8 px-3 py-2">
          <ApprovalMark className="size-3 shrink-0 text-brand-accent-strong" />
          <span className="text-[11px] leading-4 font-medium text-brand-accent-strong">
            Confirmado por Marina antes de enviar
          </span>
        </div>
      </div>
    </article>
  )
}

function SmallCell({
  index,
  icon: CellIcon,
  title,
  text,
}: {
  index: number
  icon: Icon
  title: string
  text: string
}) {
  return (
    <article
      data-reveal
      className={CELL}
      style={{ "--reveal-delay": `${360 + index * 70}ms` } as React.CSSProperties}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground">
        <CellIcon size={17} />
      </span>

      <h3 className="mt-4 text-[15px] leading-5 font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-[13.5px] leading-5 text-muted-foreground">{text}</p>
    </article>
  )
}
