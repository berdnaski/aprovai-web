import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function SuffixInput({
  id,
  value,
  onChange,
  suffix,
  width = "w-24",
  invalid = false,
  ariaLabel,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  suffix: string
  width?: string
  invalid?: boolean
  ariaLabel: string
}) {
  return (
    <div className={cn("relative shrink-0", width)}>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-9 pr-9 text-body font-medium tabular-nums md:text-body",
          invalid && "border-destructive/50",
        )}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-caption text-muted-foreground"
      >
        {suffix}
      </span>
    </div>
  )
}

export function Presets<T extends number>({
  options,
  value,
  onSelect,
  format,
}: {
  options: readonly T[]
  value: number | null
  onSelect: (option: T) => void
  format: (option: T) => string
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {options.map((option) => {
        const active = value === option

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={active}
            className={cn(
              "h-7 rounded-md border px-2 text-caption tabular-nums transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active
                ? "border-primary/25 bg-primary/[0.06] text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
            )}
          >
            {format(option)}
          </button>
        )
      })}
    </div>
  )
}
