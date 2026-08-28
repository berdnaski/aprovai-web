import { Check, PaperPlaneTilt } from "@phosphor-icons/react"

import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Requirement {
  label: string
  done: boolean
  missing: string
}

export function SubmitPanel({
  requirements,
  totalCents,
  itemCount,
  isPending,
  onSubmit,
}: {
  requirements: Requirement[]
  totalCents: string
  itemCount: number
  isPending: boolean
  onSubmit: () => void
}) {
  const pending = requirements.filter((item) => !item.done)
  const ready = pending.length === 0

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs xl:sticky xl:top-20">
      <header className="flex items-baseline justify-between gap-3 border-b border-border px-5 py-4">
        <span className="text-caption text-muted-foreground">Total</span>
        <MoneyDisplay
          cents={totalCents}
          emphasis
          className="text-heading text-foreground"
        />
      </header>

      <div className="flex flex-col gap-3 px-5 py-4">
        <p className="text-caption text-muted-foreground">
          {ready
            ? "Tudo pronto."
            : `Falta ${pending.length} ${pending.length === 1 ? "item" : "itens"} para enviar.`}
        </p>

        <ul className="flex flex-col gap-2">
          {requirements.map((item) => (
            <li key={item.label} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className={cn(
                  "mt-px flex size-4 shrink-0 items-center justify-center rounded-full border",
                  item.done
                    ? "border-brand-accent bg-brand-accent text-brand-accent-foreground"
                    : "border-border",
                )}
              >
                {item.done ? <Check size={9} weight="bold" /> : null}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-caption",
                    item.done ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {item.label}
                </span>
                {!item.done ? (
                  <span className="block text-caption text-muted-foreground">
                    {item.missing}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex flex-col gap-2 border-t border-border bg-muted/25 px-5 py-4">
        <Button
          size="lg"
          disabled={!ready || isPending}
          onClick={onSubmit}
          className="w-full gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <PaperPlaneTilt size={15} aria-hidden />
          {isPending ? "Enviando…" : "Enviar para aprovação"}
        </Button>

        <p className="text-caption leading-relaxed text-muted-foreground">
          {ready
            ? `A rota de aprovação é montada pelo valor de ${itemCount === 1 ? "1 item" : `${itemCount} itens`} e quem decide é notificado.`
            : "Enquanto for rascunho, ninguém é notificado."}
        </p>
      </footer>
    </section>
  )
}
