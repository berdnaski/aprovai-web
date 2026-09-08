import { ApprovalMark } from "@/components/shared/approval-mark"
import { WaitlistForm } from "@/features/marketing/waitlist-form"
import { useReveal } from "@/hooks/use-reveal"

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const REASSURANCE = [
  "Sem cartão e sem compromisso",
  "Chamamos por e-mail ou telefone",
  "Um aviso só, nada de newsletter",
]

export function FinalCtaSection() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.2)

  return (
    <section id="lista" className="px-20 pt-16 pb-24 max-lg:px-10 max-md:px-6 max-md:pt-10 max-md:pb-16 max-sm:px-4">
      <div
        ref={ref}
        data-shown={shown}
        className="relative mx-auto w-full max-w-[1430px] overflow-hidden rounded-[32px] bg-ink px-8 py-20 max-md:rounded-[24px] max-md:px-6 max-md:py-14"
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 80% at 22% 0%, oklch(1 0 0 / 0.1) 0%, transparent 62%), radial-gradient(90% 70% at 50% 130%, oklch(0 0 0 / 0.45) 0%, transparent 70%), linear-gradient(165deg, var(--ink-2) 0%, var(--ink) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: GRAIN }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-16 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.28), transparent)",
          }}
        />

        <div className="relative flex flex-col items-center">
          <h2
            data-reveal
            className="max-w-[620px] text-center text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.06] font-semibold tracking-[-0.02em] text-balance text-ink-foreground"
          >
            O AprovAI abre em breve. Garanta o seu lugar na fila.
          </h2>

          <p
            data-reveal
            className="mt-5 max-w-[520px] text-center text-[17px] leading-7 text-balance text-ink-muted"
            style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
          >
            Estamos abrindo aos poucos, por ordem de entrada. Deixe o{" "}

            <span className="whitespace-nowrap">e-mail</span> e a gente chama
            assim que houver vaga pra sua empresa.
          </p>

          <div
            data-reveal
            className="mt-9 flex w-full justify-center"
            style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
          >
            <WaitlistForm source="landing-cta" tone="dark" inputId="cta-email" />
          </div>

          <ul
            data-reveal
            className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2.5"
            style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
          >
            {REASSURANCE.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <ApprovalMark className="size-3 shrink-0 text-brand-accent" />
                <span className="text-[13.5px] leading-5 text-ink-muted">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
