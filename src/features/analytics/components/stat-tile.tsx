import type { Icon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export function StatTile({
  label,
  value,
  unit,
  hint,
  icon: TileIcon,
  tone = "neutral",
}: {
  label: string
  value: string
  unit?: string
  hint?: React.ReactNode
  icon: Icon
  tone?: "neutral" | "attention" | "positive"
}) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col gap-2.5 overflow-hidden rounded-lg border bg-card px-5 py-4 shadow-xs",
        tone === "attention" ? "border-warning/30" : "border-border",
      )}
    >
      {tone === "attention" ? (
        <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-warning" />
      ) : null}

      <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <TileIcon size={13} aria-hidden className="shrink-0" />
        <span className="truncate">{label}</span>
      </p>

      <p className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-display tabular-nums",
            tone === "attention" ? "text-warning-strong" : "text-foreground",
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="truncate text-body text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </p>

      {hint ? (
        <p className="text-caption leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
