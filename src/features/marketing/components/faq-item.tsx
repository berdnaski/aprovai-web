import { Plus } from "@phosphor-icons/react"
import { useState } from "react"

import { cn } from "@/lib/utils"

export function FaqItem({
  question,
  children,
}: {
  question: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-4 py-5 text-left transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="min-w-0 flex-1 text-label text-foreground">
          {question}
        </span>
        <Plus
          size={14}
          aria-hidden
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200 ease-out",
            open && "rotate-45",
          )}
        />
      </button>

      {open ? (
        <div className="flex max-w-[62ch] flex-col gap-3 pb-6 text-body leading-relaxed text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  )
}
