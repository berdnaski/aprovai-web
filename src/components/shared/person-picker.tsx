import { CaretUpDown, Check, MagnifyingGlass, X } from "@phosphor-icons/react"
import { useState } from "react"

import type { Member } from "@/api/members"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { initialsOf } from "@/lib/people"
import { cn } from "@/lib/utils"
import { ROLE_LABELS } from "@/types/enums"

export interface PersonOption {
  member: Member
  blocked?: string | null
}

export function PersonPicker({
  options,
  value,
  onChange,
  placeholder = "Selecionar pessoa",
  emptyLabel = "Ninguém",
  allowEmpty = true,
  disabled = false,
  className,
}: {
  options: PersonOption[]
  value: string | null
  onChange: (memberId: string | null) => void
  placeholder?: string
  emptyLabel?: string
  allowEmpty?: boolean
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = options.find((option) => option.member.id === value)
  const term = query.trim().toLowerCase()

  const visible = options.filter(({ member }) => {
    if (!term) {
      return true
    }

    const name = member.user?.name?.toLowerCase() ?? ""
    const email = member.user?.email?.toLowerCase() ?? ""

    return name.includes(term) || email.includes(term)
  })

  function pick(memberId: string | null) {
    onChange(memberId)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQuery("")
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-8 w-full justify-between gap-2 bg-card px-2.5 font-normal",
              className,
            )}
          />
        }
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-muted text-micro text-muted-foreground"
            >
              {initialsOf(selected.member.user?.name ?? "?")}
            </span>
            <span className="truncate text-caption text-foreground">
              {selected.member.user?.name ?? "Pessoa sem cadastro"}
            </span>
          </span>
        ) : (
          <span className="truncate text-caption text-muted-foreground">
            {value === null && allowEmpty ? emptyLabel : placeholder}
          </span>
        )}

        <CaretUpDown
          size={14}
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80 gap-0 overflow-hidden p-0">
        <div className="relative border-b border-border">
          <MagnifyingGlass
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome ou e-mail"
            aria-label="Buscar pessoa"
            autoFocus
            className="h-9 rounded-none border-0 pl-8 text-caption focus-visible:ring-0 md:text-caption"
          />
        </div>

        <div className="max-h-64 overflow-y-auto p-1">
          {allowEmpty ? (
            <button
              type="button"
              onClick={() => pick(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-caption transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                value === null
                  ? "bg-primary/6 text-primary"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-border"
              >
                <X size={11} className="text-muted-foreground" />
              </span>
              {emptyLabel}
              {value === null ? (
                <Check size={13} weight="bold" className="ml-auto" aria-hidden />
              ) : null}
            </button>
          ) : null}

          {visible.length === 0 ? (
            <p className="px-2 py-6 text-center text-caption text-muted-foreground">
              Ninguém encontrado.
            </p>
          ) : (
            visible.map(({ member, blocked }) => {
              const isSelected = member.id === value
              const name = member.user?.name ?? "Pessoa sem cadastro"

              return (
                <button
                  key={member.id}
                  type="button"
                  disabled={Boolean(blocked)}
                  onClick={() => pick(member.id)}
                  title={blocked ?? undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    blocked
                      ? "cursor-not-allowed opacity-50"
                      : isSelected
                        ? "bg-primary/6"
                        : "hover:bg-muted/60",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-5.5 shrink-0 items-center justify-center rounded-full text-micro",
                      isSelected
                        ? "bg-primary/12 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {initialsOf(name)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-caption text-foreground">
                      {name}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {blocked ?? ROLE_LABELS[member.role]}
                    </span>
                  </span>

                  {isSelected ? (
                    <Check
                      size={13}
                      weight="bold"
                      className="shrink-0 text-primary"
                      aria-hidden
                    />
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
