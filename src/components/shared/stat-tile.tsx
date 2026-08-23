import type { Icon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export function StatRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
  icon: TileIcon,
  tone = "neutral",
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: Icon
  tone?: "neutral" | "brand" | "warning"
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
      <div className="min-w-0">
        <p className="text-caption text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-heading tabular-nums",
            tone === "warning" ? "text-warning-strong" : "text-foreground",
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-caption text-muted-foreground">{hint}</p>
        ) : null}
      </div>

      {TileIcon ? (
        <span
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            tone === "brand"
              ? "bg-primary/8 text-primary"
              : tone === "warning"
                ? "bg-warning/10 text-warning-strong"
                : "bg-muted text-muted-foreground",
          )}
        >
          <TileIcon size={16} />
        </span>
      ) : null}
    </div>
  )
}
