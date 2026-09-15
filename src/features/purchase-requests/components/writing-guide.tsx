import { Check, Plus } from "@phosphor-icons/react"

import type { WritingHint } from "../request-hints"

export function WritingGuide({
  hints,
  onSuggest,
}: {
  hints: WritingHint[]
  onSuggest: (hint: WritingHint) => void
}) {
  const missing = hints.filter((hint) => !hint.done).length

  return (
    <div className="flex flex-col gap-2 border-t border-border/60 px-4 pt-3 pb-2">
      <p aria-live="polite" className="text-micro text-muted-foreground">
        {missing === 0
          ? "Tudo que quem aprova costuma perguntar já está no texto."
          : `${missing === 1 ? "Falta 1 informação" : `Faltam ${missing} informações`} para quem aprova não precisar perguntar. Clique para completar.`}
      </p>

      <ul className="flex flex-wrap gap-1.5">
        {hints.map((hint) => (
          <li key={hint.key}>
            {hint.done ? (
              <span className="inline-flex h-7 items-center gap-1 rounded-full bg-muted/60 px-2.5 text-caption text-muted-foreground">
                <Check
                  size={12}
                  weight="bold"
                  aria-hidden
                  className="text-brand-accent-strong"
                />
                {hint.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSuggest(hint)}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-border px-2.5 text-caption text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Plus size={11} weight="bold" aria-hidden />
                {hint.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
