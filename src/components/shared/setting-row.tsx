import { Check, Warning } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SettingGroup({
  title,
  description,
  count,
  action,
  footer,
  children,
  className,
}: {
  title: string
  description?: string
  count?: number
  action?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rise-in flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs",
        className,
      )}
    >
      <header
        className={cn(
          "flex gap-2 border-b border-border px-5",
          description ? "flex-col justify-center py-3.5" : "min-h-12 items-center",
        )}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-caption font-medium text-foreground">{title}</h2>
          {count !== undefined ? (
            <span className="rounded bg-muted px-1.5 text-caption tabular-nums text-muted-foreground">
              {count}
            </span>
          ) : null}
          {action ? <div className="ml-auto">{action}</div> : null}
        </div>

        {description ? (
          <p className="text-caption leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>

      <div className="divide-y divide-border/50">{children}</div>

      {footer ? (
        <div className="border-t border-border bg-muted/25 px-5 py-3">
          {footer}
        </div>
      ) : null}
    </section>
  )
}

export function SettingRow({
  label,
  description,
  control,
  status,
  hint,
  error,
}: {
  label: string
  description?: string
  control: React.ReactNode
  status?: React.ReactNode
  hint?: React.ReactNode
  error?: string
}) {
  const stacked = Boolean(hint || error)

  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:gap-6",
        stacked ? "sm:items-start" : "sm:items-center",
      )}
    >
      <div className={cn("sm:w-52 sm:shrink-0", stacked && "sm:pt-1.5")}>
        <p className="text-caption text-muted-foreground">{label}</p>
        {description ? (
          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground/70">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          {control}
          {status}
        </div>

        {error ? (
          <p className="text-caption text-destructive">{error}</p>
        ) : hint ? (
          <div className="text-caption leading-relaxed text-muted-foreground">
            {hint}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function SettingActions({
  dirtyCount,
  blocked = false,
  pending = false,
  onReset,
}: {
  dirtyCount: number
  blocked?: boolean
  pending?: boolean
  onReset: () => void
}) {
  const dirty = dirtyCount > 0

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <p
        className={cn(
          "flex items-center gap-1.5 text-caption",
          blocked
            ? "text-warning-strong"
            : dirty
              ? "text-foreground"
              : "text-muted-foreground",
        )}
      >
        {blocked ? (
          <Warning size={13} weight="fill" aria-hidden />
        ) : dirty ? null : (
          <Check size={13} weight="bold" aria-hidden />
        )}
        {blocked
          ? "Corrija os campos marcados"
          : dirty
            ? `${dirtyCount} ${dirtyCount === 1 ? "alteração não salva" : "alterações não salvas"}`
            : "Tudo salvo"}
      </p>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onReset}
          disabled={!dirty || pending}
          className="font-medium"
        >
          Descartar
        </Button>

        <Button
          type="submit"
          size="lg"
          disabled={!dirty || blocked || pending}
          className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {pending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </div>
  )
}
