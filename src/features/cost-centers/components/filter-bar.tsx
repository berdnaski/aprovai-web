import { MagnifyingGlass } from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface FilterScope<T extends string> {
  value: T
  label: string
  count: number
}

export function FilterBar<T extends string>({
  scopes,
  scope,
  onScopeChange,
  query,
  onQueryChange,
  placeholder,
}: {
  scopes: FilterScope<T>[]
  scope: T
  onScopeChange: (value: T) => void
  query: string
  onQueryChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border">
      <div
        role="tablist"
        aria-label="Filtrar por situação"
        className="flex items-center gap-4"
      >
        {scopes.map((item) => {
          const selected = item.value === scope

          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onScopeChange(item.value)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 pb-2 text-label whitespace-nowrap",
                "transition-colors duration-150",
                "focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent font-normal text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded px-1 text-caption tabular-nums transition-colors",
                  selected
                    ? "bg-muted text-muted-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {item.count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="relative mb-2 min-w-0 flex-1 sm:max-w-64">
        <MagnifyingGlass
          size={14}
          className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-8"
        />
      </div>
    </div>
  )
}
