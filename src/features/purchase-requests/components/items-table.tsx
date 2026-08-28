import { Check, Plus, Trash, X } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { RequestItem } from "@/api/purchase-requests"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import {
  useAddItem,
  useDeleteItem,
  useUpdateItem,
} from "@/hooks/purchase-requests/use-purchase-requests"
import { cn } from "@/lib/utils"

interface Draft {
  description: string
  quantity: string
  unit: string
  unitPriceCents: string
}

const EMPTY: Draft = {
  description: "",
  quantity: "1",
  unit: "un",
  unitPriceCents: "",
}

function isValid(draft: Draft): boolean {
  return (
    draft.description.trim().length > 0 &&
    Number(draft.quantity.replace(",", ".")) > 0 &&
    draft.unit.trim().length > 0 &&
    Number(draft.unitPriceCents || "0") > 0
  )
}

function Row({
  item,
  requestId,
  readOnly,
}: {
  item: RequestItem
  requestId: string
  readOnly: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>({
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unitPriceCents: item.unitPriceCents,
  })

  const update = useUpdateItem(requestId)
  const remove = useDeleteItem(requestId)

  function save() {
    if (!isValid(draft)) {
      return
    }

    update.mutate(
      { itemId: item.id, payload: draft },
      {
        onSuccess: () => setEditing(false),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
        <Input
          value={draft.description}
          onChange={(event) =>
            setDraft({ ...draft, description: event.target.value })
          }
          aria-label="Descrição do item"
          className="h-8 flex-1 text-caption md:text-caption"
        />
        <Input
          value={draft.quantity}
          onChange={(event) =>
            setDraft({ ...draft, quantity: event.target.value })
          }
          aria-label="Quantidade"
          inputMode="decimal"
          className="h-8 w-20 text-caption tabular-nums md:text-caption"
        />
        <Input
          value={draft.unit}
          onChange={(event) => setDraft({ ...draft, unit: event.target.value })}
          aria-label="Unidade"
          className="h-8 w-16 text-caption md:text-caption"
        />
        <MoneyInput
          size="sm"
          value={draft.unitPriceCents}
          onChange={(cents) => setDraft({ ...draft, unitPriceCents: cents })}
          ariaLabel="Preço unitário"
          className="w-32"
        />

        <span className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={save}
            disabled={!isValid(draft) || update.isPending}
            aria-label="Salvar item"
            className="flex size-7 items-center justify-center rounded-md text-brand-accent-strong transition-colors hover:bg-brand-accent/10 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Check size={14} weight="bold" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            aria-label="Descartar alterações"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X size={14} aria-hidden />
          </button>
        </span>
      </li>
    )
  }

  return (
    <li
      className={cn(
        "group/item flex items-center gap-3 px-4 py-2.5",
        !readOnly && "cursor-text hover:bg-muted/30",
      )}
      onClick={readOnly ? undefined : () => setEditing(true)}
    >
      <span className="min-w-0 flex-1 truncate text-caption text-foreground">
        {item.description}
      </span>

      <span className="w-20 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
        {item.quantity} {item.unit}
      </span>

      <span className="hidden w-28 shrink-0 text-right text-caption tabular-nums text-muted-foreground sm:block">
        <MoneyDisplay cents={item.unitPriceCents} />
      </span>

      <span className="w-28 shrink-0 text-right">
        <MoneyDisplay cents={item.totalCents} emphasis />
      </span>

      {readOnly ? null : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            remove.mutate(item.id, {
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }}
          aria-label={`Remover ${item.description}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover/item:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Trash size={13} aria-hidden />
        </button>
      )}
    </li>
  )
}

export function ItemsTable({
  requestId,
  items,
  totalCents,
  readOnly = false,
}: {
  requestId: string
  items: RequestItem[]
  totalCents: string
  readOnly?: boolean
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)

  const add = useAddItem(requestId)

  function create() {
    if (!isValid(draft)) {
      return
    }

    add.mutate(draft, {
      onSuccess: () => {
        setDraft(EMPTY)
        setAdding(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex min-h-12 items-center gap-2 border-b border-border px-5">
        <h2 className="text-caption font-medium text-foreground">Itens</h2>
        <span className="rounded bg-muted px-1.5 text-caption tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </header>

      {items.length > 0 || adding ? (
        <div className="hidden items-center gap-3 border-b border-border bg-muted/35 px-4 py-1.5 sm:flex">
          <span className="min-w-0 flex-1 text-overline text-muted-foreground/70">
            Descrição
          </span>
          <span className="w-20 shrink-0 text-right text-overline text-muted-foreground/70">
            Qtd
          </span>
          <span className="w-28 shrink-0 text-right text-overline text-muted-foreground/70">
            Unitário
          </span>
          <span className="w-28 shrink-0 text-right text-overline text-muted-foreground/70">
            Total
          </span>
          {readOnly ? null : <span aria-hidden className="w-7 shrink-0" />}
        </div>
      ) : null}

      {items.length === 0 && !adding ? (
        <p className="px-5 py-8 text-center text-caption leading-relaxed text-muted-foreground">
          {readOnly
            ? "Este pedido não tem itens."
            : "Nenhum item ainda. É a soma deles que define quem precisa aprovar."}
        </p>
      ) : (
        <ul className="divide-y divide-border/50">
          {items.map((item) => (
            <Row
              key={item.id}
              item={item}
              requestId={requestId}
              readOnly={readOnly}
            />
          ))}
        </ul>
      )}

      {adding ? (
        <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
          <Input
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            placeholder="O que está sendo comprado"
            aria-label="Descrição do item"
            autoFocus
            className="h-8 flex-1 text-caption md:text-caption"
          />
          <Input
            value={draft.quantity}
            onChange={(event) =>
              setDraft({ ...draft, quantity: event.target.value })
            }
            aria-label="Quantidade"
            inputMode="decimal"
            className="h-8 w-20 text-caption tabular-nums md:text-caption"
          />
          <Input
            value={draft.unit}
            onChange={(event) => setDraft({ ...draft, unit: event.target.value })}
            aria-label="Unidade"
            className="h-8 w-16 text-caption md:text-caption"
          />
          <MoneyInput
            size="sm"
            value={draft.unitPriceCents}
            onChange={(cents) => setDraft({ ...draft, unitPriceCents: cents })}
            ariaLabel="Preço unitário"
            className="w-32"
          />

          <span className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={create}
              disabled={!isValid(draft) || add.isPending}
              aria-label="Adicionar item"
              className="flex size-7 items-center justify-center rounded-md text-brand-accent-strong transition-colors hover:bg-brand-accent/10 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Check size={14} weight="bold" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(EMPTY)
                setAdding(false)
              }}
              aria-label="Descartar item"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X size={14} aria-hidden />
            </button>
          </span>
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border bg-muted/25 px-4 py-2.5">
        {readOnly ? null : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAdding(true)}
            disabled={adding}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Plus size={13} weight="bold" aria-hidden />
            Adicionar item
          </Button>
        )}

        <span className="ml-auto flex items-baseline gap-2">
          <span className="text-caption text-muted-foreground">Total</span>
          <MoneyDisplay
            cents={totalCents}
            emphasis
            className="text-body text-foreground"
          />
        </span>
      </footer>
    </section>
  )
}
