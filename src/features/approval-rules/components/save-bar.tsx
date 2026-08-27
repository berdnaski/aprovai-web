import { WarningCircle } from "@phosphor-icons/react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SaveBar({
  visible,
  dirtyCount,
  problemCount,
  problemElsewhere,
  isPending,
  onDiscard,
  onSave,
  className,
}: {
  visible: boolean
  dirtyCount: number
  problemCount: number
  problemElsewhere?: { label: string; onFocus: () => void }
  isPending: boolean
  onDiscard: () => void
  onSave: () => void
  className?: string
}) {
  const blocked = problemCount > 0

  useEffect(() => {
    if (!visible || blocked || isPending) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        onSave()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [visible, blocked, isPending, onSave])

  if (!visible) {
    return null
  }

  return (
    <div
      role="status"
      className={cn(
        "rise-in sticky bottom-4 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-4 py-2.5 shadow-md",
        className,
      )}
    >
      {blocked ? (
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-caption text-destructive">
          <WarningCircle size={15} className="shrink-0" aria-hidden />
          {problemCount === 1
            ? "Uma faixa precisa de ajuste antes de salvar."
            : `${problemCount} faixas precisam de ajuste antes de salvar.`}

          {problemElsewhere ? (
            <button
              type="button"
              onClick={problemElsewhere.onFocus}
              className="rounded-sm underline underline-offset-2 transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Ver em {problemElsewhere.label}
            </button>
          ) : null}
        </p>
      ) : (
        <p className="flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full bg-warning"
          />
          {dirtyCount > 1
            ? `${dirtyCount} matrizes com alterações não salvas.`
            : "Alterações não salvas."}{" "}
          Elas valem só para pedidos abertos depois.
        </p>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground"
        >
          {dirtyCount > 1 ? "Descartar tudo" : "Descartar"}
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={blocked || isPending}
          className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {isPending
            ? "Salvando…"
            : dirtyCount > 1
              ? `Salvar ${dirtyCount} matrizes`
              : "Salvar matriz"}
        </Button>
      </div>
    </div>
  )
}
