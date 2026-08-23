import { ArrowUUpLeft, Receipt } from "@phosphor-icons/react"

import { MoneyDisplay } from "@/components/shared/money-display"
import { cn } from "@/lib/utils"
import { BudgetEntryType } from "@/types/enums"

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
})

export function EntryRow({
  description,
  type,
  amountCents,
  occurredAt,
}: {
  description: string | null
  type: BudgetEntryType
  amountCents: string
  occurredAt: string
}) {
  const isReversal = type === BudgetEntryType.REVERSAL

  return (
    <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40">
      <span
        aria-hidden
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isReversal
            ? "bg-brand-accent/12 text-brand-accent-strong"
            : "bg-muted text-muted-foreground",
        )}
      >
        {isReversal ? <ArrowUUpLeft size={13} /> : <Receipt size={13} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-body text-foreground">
          {description ?? "Movimentação de orçamento"}
        </p>
        <p className="truncate text-caption text-muted-foreground">
          {isReversal ? "devolveu saldo" : "consumiu saldo"}
        </p>
      </div>

      <p className="hidden w-20 shrink-0 text-caption text-muted-foreground sm:block">
        {DATE.format(new Date(occurredAt))}
      </p>

      <div className="w-32 shrink-0 text-right">
        <p
          className={cn(
            "text-body font-medium tabular-nums",
            isReversal ? "text-brand-accent-strong" : "text-foreground",
          )}
        >
          {isReversal ? "+" : "−"}
          <MoneyDisplay cents={amountCents.replace("-", "")} />
        </p>
      </div>
    </div>
  )
}
