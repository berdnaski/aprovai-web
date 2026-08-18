import { ApprovalMark } from "@/components/shared/approval-mark"
import { cn } from "@/lib/utils"
import {
  resolveStatus,
  type StatusMeta,
  type StatusTone,
} from "@/lib/status-labels"

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  progress: "border-primary/20 bg-primary/[0.07] text-primary",
  success:
    "border-brand-accent/25 bg-brand-accent/[0.09] text-brand-accent-strong",
  warning: "border-warning/25 bg-warning/[0.09] text-warning-strong",
  danger: "border-destructive/25 bg-destructive/[0.08] text-destructive",
}

export function StatusBadge({
  map,
  value,
  className,
}: {
  map: Record<string, StatusMeta>
  value: string
  className?: string
}) {
  const status = resolveStatus(map, value)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-caption font-medium whitespace-nowrap",
        TONE_CLASS[status.tone],
        className,
      )}
    >
      {status.tone === "success" ? (
        <ApprovalMark className="size-3 shrink-0" />
      ) : null}
      {status.label}
    </span>
  )
}
