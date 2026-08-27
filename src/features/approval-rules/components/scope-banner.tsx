import { CaretDown } from "@phosphor-icons/react"
import { useState } from "react"

import type { ApprovalScope } from "@/api/approval-rules"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import {
  describeScope,
  isGlobalScope,
  type ScopeMatrix,
  type ScopeNames,
} from "../matrix"
import { SCOPE_ICON } from "../icons"
import { ScopeList } from "./scope-list"

export function ScopeBanner({
  scope,
  names,
  matrices,
  onSelect,
  onCreate,
  dirtyKeys,
  actions,
  className,
}: {
  scope: ApprovalScope
  names: ScopeNames
  matrices: ScopeMatrix[]
  onSelect: (scope: ApprovalScope) => void
  onCreate?: () => void
  dirtyKeys?: Set<string>
  actions?: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const described = describeScope(scope, names)
  const ScopeIcon = SCOPE_ICON[described.kind]
  const global = isGlobalScope(scope)

  const title = (
    <span
      className={cn(
        "truncate text-body font-semibold",
        global ? "text-foreground" : "text-foreground",
      )}
    >
      {described.title}
    </span>
  )

  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
            global
              ? "bg-muted text-muted-foreground"
              : "bg-primary/[0.08] text-primary",
          )}
        >
          <ScopeIcon size={16} />
        </span>

        <div className="min-w-0">
          <div className="hidden min-w-0 items-center gap-2 xl:flex">
            {title}
            {global ? null : (
              <span className="shrink-0 rounded bg-muted px-1.5 py-px text-micro text-muted-foreground">
                exceção
              </span>
            )}
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  aria-label="Trocar de matriz"
                  className={cn(
                    "-ml-1.5 flex min-w-0 max-w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors xl:hidden",
                    "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                />
              }
            >
              {title}
              <CaretDown
                size={11}
                weight="bold"
                aria-hidden
                className="shrink-0 text-muted-foreground"
              />
            </PopoverTrigger>

            <PopoverContent align="start" className="w-80 p-2">
              <ScopeList
                matrices={matrices}
                names={names}
                activeScope={scope}
                dirtyKeys={dirtyKeys}
                onSelect={(next) => {
                  onSelect(next)
                  setOpen(false)
                }}
                onCreate={
                  onCreate
                    ? () => {
                        setOpen(false)
                        onCreate()
                      }
                    : undefined
                }
              />
            </PopoverContent>
          </Popover>

          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
            {described.detail}
          </p>
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
