import { cn } from "@/lib/utils"

export function SettingGroup({
  title,
  count,
  action,
  children,
  className,
}: {
  title: string
  count?: number
  action?: React.ReactNode
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
      <header className="flex min-h-12 items-center gap-2 border-b border-border px-5">
        <h2 className="text-caption font-medium text-foreground">{title}</h2>
        {count !== undefined ? (
          <span className="rounded bg-muted px-1.5 text-caption tabular-nums text-muted-foreground">
            {count}
          </span>
        ) : null}
        {action ? <div className="ml-auto">{action}</div> : null}
      </header>

      <div className="divide-y divide-border/50">{children}</div>
    </section>
  )
}

export function SettingRow({
  label,
  control,
  status,
}: {
  label: string
  control: React.ReactNode
  status?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
      <p className="text-caption text-muted-foreground sm:w-40 sm:shrink-0">
        {label}
      </p>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
        {control}
        {status}
      </div>
    </div>
  )
}
