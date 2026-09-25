import { cn } from "@/lib/utils"
import { RequestStatus } from "@/types/enums"

import { requestStatusInfo, TONE_TEXT } from "../request-status"

export function RequestStatusMark({
  status,
  currentApproverName,
  size = "sm",
  className,
}: {
  status: RequestStatus
  currentApproverName?: string | null
  size?: "sm" | "lg"
  className?: string
}) {
  const info = requestStatusInfo(status, currentApproverName)
  const Icon = info.icon

  if (size === "lg") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full bg-current/10",
            TONE_TEXT[info.tone],
          )}
        >
          <Icon size={15} weight="bold" aria-hidden />
        </span>
        <span
          className={cn(
            "text-body font-semibold text-balance",
            TONE_TEXT[info.tone],
          )}
        >
          {info.headline}
        </span>
      </div>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-caption font-medium",
        TONE_TEXT[info.tone],
        className,
      )}
    >
      <Icon size={12} weight="bold" className="shrink-0" aria-hidden />
      <span className="truncate">{info.headline}</span>
    </span>
  )
}
