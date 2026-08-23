import { cn } from "@/lib/utils"

export function EmptyStateIcon({
  icon: Icon,
  tone = "neutral",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone?: "neutral" | "warning" | "primary"
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-16 items-center justify-center rounded-full",
        tone === "warning"
          ? "bg-warning/8"
          : tone === "primary"
            ? "bg-primary/6"
            : "bg-muted/60",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full border",
          tone === "warning"
            ? "border-warning/15"
            : tone === "primary"
              ? "border-primary/15"
              : "border-border",
        )}
      />
      <span
        className={cn(
          "absolute inset-1.75 rounded-full border",
          tone === "warning"
            ? "border-warning/20"
            : tone === "primary"
              ? "border-primary/20"
              : "border-border/70",
        )}
      />
      <Icon
        className={cn(
          "relative size-5",
          tone === "warning"
            ? "text-warning-strong"
            : tone === "primary"
              ? "text-primary"
              : "text-muted-foreground",
        )}
      />
    </span>
  )
}

export function EmptyState({
  icon: Icon,
  tone = "neutral",
  title,
  description,
  action,
  variant = "framed",
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>
  tone?: "neutral" | "warning" | "primary"
  title: string
  description?: string
  action?: React.ReactNode
  variant?: "framed" | "inline"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        variant === "framed"
          ? "rounded-lg border border-dashed border-border bg-card/50 py-14"
          : "min-h-48 flex-1 py-12",
        className,
      )}
    >
      {Icon ? <EmptyStateIcon icon={Icon} tone={tone} className="mb-5" /> : null}

      <p className="text-body font-semibold text-foreground">{title}</p>

      {description ? (
        <p className="mt-1.5 max-w-sm text-caption leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
