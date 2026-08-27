import { Input as InputPrimitive } from "@base-ui/react/input"
import { useLayoutEffect, useRef } from "react"

import { digitsToCents, formatCentsPlain } from "@/lib/money"
import { cn } from "@/lib/utils"

type Size = "sm" | "default" | "lg"
type Variant = "default" | "quiet"

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-7 pl-7 pr-2 text-caption",
  default: "h-9 pl-9 pr-2.5 text-body",
  lg: "h-11 pl-10 pr-3 text-heading",
}

const PREFIX_CLASS: Record<Size, string> = {
  sm: "left-2 text-micro",
  default: "left-2.5 text-caption",
  lg: "left-3 text-body",
}

export function MoneyInput({
  value,
  onChange,
  size = "default",
  variant = "default",
  invalid = false,
  disabled = false,
  placeholder = "0,00",
  className,
  id,
  name,
  autoFocus,
  onBlur,
  ariaLabel,
  ariaDescribedBy,
}: {
  value: string
  onChange: (cents: string) => void
  size?: Size
  variant?: Variant
  invalid?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
  name?: string
  autoFocus?: boolean
  onBlur?: () => void
  ariaLabel?: string
  ariaDescribedBy?: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    const input = ref.current

    if (!input || document.activeElement !== input) {
      return
    }

    const end = input.value.length
    input.setSelectionRange(end, end)
  }, [value])

  return (
    <div className={cn("relative min-w-0", className)}>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 tabular-nums",
          PREFIX_CLASS[size],
          disabled
            ? "text-muted-foreground/50"
            : value
              ? "text-muted-foreground"
              : "text-muted-foreground/70",
        )}
      >
        R$
      </span>

      <InputPrimitive
        ref={ref}
        id={id}
        name={name}
        autoFocus={autoFocus}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        placeholder={placeholder}
        value={value ? formatCentsPlain(value) : ""}
        onBlur={onBlur}
        onFocus={(event) => {
          const end = event.currentTarget.value.length
          event.currentTarget.setSelectionRange(end, end)
        }}
        onChange={(event) => onChange(digitsToCents(event.target.value))}
        className={cn(
          "w-full min-w-0 rounded-md font-medium tabular-nums transition-colors outline-none",
          "text-foreground placeholder:font-normal placeholder:text-muted-foreground/70",
          "disabled:cursor-not-allowed disabled:opacity-60",
          SIZE_CLASS[size],
          variant === "quiet"
            ? "border border-transparent bg-transparent hover:border-border hover:bg-card focus-visible:border-primary/40 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring"
            : "border border-input bg-card focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring",
          invalid &&
            "border-destructive/50 bg-destructive/[0.03] focus-visible:border-destructive/60 focus-visible:ring-destructive/20",
        )}
      />
    </div>
  )
}
