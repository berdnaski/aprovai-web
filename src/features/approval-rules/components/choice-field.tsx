import { CaretDown, Check, Lock } from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { useState } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface ChoiceOption<T> {
  value: T
  label: string
  detail?: string
  icon?: Icon
}

const FIELD =
  "flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border px-3 text-body"

export function ChoiceField<T extends string | boolean>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  locked = false,
  lockedLabel,
  lockedReason,
  className,
}: {
  value: T
  options: ChoiceOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  disabled?: boolean
  locked?: boolean
  lockedLabel?: string
  lockedReason?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const selected = options.find((option) => option.value === value)
  const SelectedIcon = selected?.icon

  if (locked) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              tabIndex={0}
              aria-label={ariaLabel}
              className={cn(
                FIELD,
                "cursor-help border-primary/25 bg-primary/[0.06] font-medium text-primary",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                className,
              )}
            />
          }
        >
          <span className="truncate">{lockedLabel ?? selected?.label}</span>
          <Lock size={11} aria-hidden className="ml-auto shrink-0 opacity-60" />
        </TooltipTrigger>
        <TooltipContent>{lockedReason}</TooltipContent>
      </Tooltip>
    )
  }

  if (disabled) {
    return (
      <span className={cn(FIELD, "border-border text-foreground", className)}>
        {SelectedIcon ? (
          <SelectedIcon
            size={15}
            aria-hidden
            className="shrink-0 text-muted-foreground"
          />
        ) : null}
        <span className="truncate">{selected?.label}</span>
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`${ariaLabel}: ${selected?.label ?? ""}`}
            className={cn(
              FIELD,
              "border-input bg-card transition-colors",
              "hover:border-muted-foreground/30",
              "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              "aria-expanded:border-primary/40",
              className,
            )}
          />
        }
      >
        {SelectedIcon ? (
          <SelectedIcon
            size={15}
            aria-hidden
            className="shrink-0 text-muted-foreground"
          />
        ) : null}
        <span className="truncate text-foreground">{selected?.label}</span>
        <CaretDown
          size={11}
          weight="bold"
          aria-hidden
          className="ml-auto shrink-0 text-muted-foreground"
        />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 gap-0.5 p-1">
        {options.map((option) => {
          const OptionIcon = option.icon
          const active = option.value === value

          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active ? "bg-primary/6" : "hover:bg-muted/60",
              )}
            >
              {OptionIcon ? (
                <OptionIcon
                  size={15}
                  aria-hidden
                  className={cn(
                    "mt-0.5 shrink-0",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
              ) : null}

              <span className="min-w-0 flex-1">
                <span className="block text-caption font-medium text-foreground">
                  {option.label}
                </span>
                {option.detail ? (
                  <span className="mt-0.5 block text-caption leading-relaxed text-muted-foreground">
                    {option.detail}
                  </span>
                ) : null}
              </span>

              {active ? (
                <Check
                  size={13}
                  weight="bold"
                  aria-hidden
                  className="mt-0.5 shrink-0 text-primary"
                />
              ) : null}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
