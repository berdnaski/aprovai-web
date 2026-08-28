import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { URGENCY_LABELS, Urgency } from "@/types/enums"

const TONE: Record<Urgency, string> = {
  LOW: "bg-muted-foreground/25",
  MEDIUM: "bg-muted-foreground/45",
  HIGH: "bg-warning",
}

export function UrgencyMark({ urgency }: { urgency: Urgency }) {
  if (urgency === Urgency.MEDIUM) {
    return null
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            tabIndex={0}
            className="flex shrink-0 items-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
        }
      >
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", TONE[urgency])}
        />
        <span className="sr-only">Urgência {URGENCY_LABELS[urgency]}</span>
      </TooltipTrigger>
      <TooltipContent>Urgência {URGENCY_LABELS[urgency]}</TooltipContent>
    </Tooltip>
  )
}
