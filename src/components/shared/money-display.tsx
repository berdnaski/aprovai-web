import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

export function MoneyDisplay({
  cents,
  className,
  emphasis = false,
}: {
  cents: string | number | bigint | null | undefined
  className?: string
  emphasis?: boolean
}) {
  if (cents === null || cents === undefined) {
    return <span className={cn("text-muted-foreground", className)}>Sem valor</span>
  }

  return (
    <span
      className={cn(
        "tabular-nums",
        emphasis ? "font-semibold text-foreground" : null,
        className,
      )}
    >
      {formatCents(cents)}
    </span>
  )
}
