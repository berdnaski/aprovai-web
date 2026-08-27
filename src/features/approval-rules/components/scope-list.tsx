import { Plus } from "@phosphor-icons/react"

import type { ApprovalScope } from "@/api/approval-rules"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { SCOPE_ICON } from "../icons"
import {
  describeScope,
  isGlobalScope,
  isSameScope,
  scopeKey,
  specificityOf,
  type ScopeMatrix,
  type ScopeNames,
} from "../matrix"

function ScopeButton({
  matrix,
  names,
  active,
  dirty,
  onSelect,
}: {
  matrix: ScopeMatrix
  names: ScopeNames
  active: boolean
  dirty: boolean
  onSelect: () => void
}) {
  const described = describeScope(matrix.scope, names)
  const ScopeIcon = SCOPE_ICON[described.kind]
  const count = matrix.rules.length

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group/scope relative flex w-full items-center gap-2.5 rounded-md py-2 pr-2 pl-2.5 text-left transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active ? "bg-primary/[0.07]" : "hover:bg-muted/60",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
        />
      ) : null}

      <ScopeIcon
        size={15}
        aria-hidden
        className={cn(
          "shrink-0",
          active ? "text-primary" : "text-muted-foreground",
        )}
      />

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-caption",
            active ? "font-medium text-primary" : "text-foreground",
          )}
        >
          {described.title}
        </span>
        <span className="mt-0.5 block truncate text-micro font-normal text-muted-foreground">
          {count === 0
            ? "sem faixas"
            : `${count} ${count === 1 ? "faixa" : "faixas"}`}
        </span>
      </span>

      {dirty ? (
        <span
          aria-label="alterações não salvas"
          title="alterações não salvas"
          className="size-1.5 shrink-0 rounded-full bg-warning"
        />
      ) : null}
    </button>
  )
}

export function ScopeList({
  matrices,
  names,
  activeScope,
  onSelect,
  onCreate,
  dirtyKeys,
  className,
}: {
  matrices: ScopeMatrix[]
  names: ScopeNames
  activeScope: ApprovalScope
  onSelect: (scope: ApprovalScope) => void
  onCreate?: () => void
  dirtyKeys?: Set<string>
  className?: string
}) {
  const base = matrices.find((matrix) => isGlobalScope(matrix.scope))
  const exceptions = matrices
    .filter((matrix) => !isGlobalScope(matrix.scope))
    .sort((a, b) => specificityOf(b.scope) - specificityOf(a.scope))

  return (
    <nav className={cn("flex flex-col gap-4", className)} aria-label="Matrizes">
      {base ? (
        <div className="flex flex-col gap-1">
          <ScopeButton
            matrix={base}
            names={names}
            active={isGlobalScope(activeScope)}
            dirty={dirtyKeys?.has(scopeKey(base.scope)) ?? false}
            onSelect={() => onSelect(base.scope)}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <p className="flex items-baseline gap-1.5 px-2.5 text-overline text-muted-foreground/70">
          Exceções
          {exceptions.length > 0 ? (
            <span className="tabular-nums text-muted-foreground/50">
              {exceptions.length}
            </span>
          ) : null}
        </p>

        {exceptions.length === 0 ? (
          <p className="px-2.5 py-1 text-caption leading-relaxed text-muted-foreground">
            Nenhuma ainda.
          </p>
        ) : (
          exceptions.map((matrix) => (
            <ScopeButton
              key={scopeKey(matrix.scope)}
              matrix={matrix}
              names={names}
              active={isSameScope(matrix.scope, activeScope)}
              dirty={dirtyKeys?.has(scopeKey(matrix.scope)) ?? false}
              onSelect={() => onSelect(matrix.scope)}
            />
          ))
        )}

        {onCreate ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreate}
            className="mt-0.5 justify-start gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Plus size={13} weight="bold" aria-hidden />
            Nova exceção
          </Button>
        ) : null}
      </div>

      {exceptions.length > 0 ? (
        <p className="border-t border-border/60 px-2.5 pt-3 text-caption leading-relaxed text-muted-foreground">
          Vale sempre a mais específica.
        </p>
      ) : null}
    </nav>
  )
}
