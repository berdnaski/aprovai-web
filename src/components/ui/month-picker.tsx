import { CaretLeft, CaretRight, Check } from "@phosphor-icons/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { BudgetPeriodType } from "@/types/enums"
import { cn } from "@/lib/utils"

const QUARTERS = [
  { label: "T1", months: [0, 1, 2] },
  { label: "T2", months: [3, 4, 5] },
  { label: "T3", months: [6, 7, 8] },
  { label: "T4", months: [9, 10, 11] },
]

const MONTH_NAMES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
]

export function isMonthAllowed(
  monthIndex: number,
  type: BudgetPeriodType,
): boolean {
  if (type === BudgetPeriodType.ANNUAL) {
    return monthIndex === 0
  }

  if (type === BudgetPeriodType.QUARTERLY) {
    return monthIndex % 3 === 0
  }

  return true
}

export function toPeriodValue(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`
}

export function MonthPicker({
  value,
  onChange,
  periodType = BudgetPeriodType.MONTHLY,
  takenPeriods = [],
  allowPast = false,
  className,
}: {
  value: string
  onChange: (value: string) => void
  periodType?: BudgetPeriodType
  takenPeriods?: string[]
  allowPast?: boolean
  className?: string
}) {
  const [selectedYear, selectedMonth] = value.split("-").map(Number)
  const [year, setYear] = useState(selectedYear || new Date().getFullYear())

  const taken = new Set(takenPeriods)
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  const minYear = allowPast ? year - 5 : currentYear

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Ano anterior"
          disabled={year <= minYear}
          onClick={() => setYear((current) => current - 1)}
          className="text-muted-foreground"
        >
          <CaretLeft size={14} />
        </Button>

        <div className="flex items-baseline gap-1.5">
          <span className="text-label font-medium text-foreground tabular-nums">
            {year}
          </span>
          {year === currentYear ? (
            <span className="text-caption text-muted-foreground">atual</span>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Próximo ano"
          onClick={() => setYear((current) => current + 1)}
          className="text-muted-foreground"
        >
          <CaretRight size={14} />
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-border/60">
        {QUARTERS.map((quarter) => (
          <div key={quarter.label} className="flex items-stretch">
            <span
              aria-hidden
              className="flex w-9 shrink-0 items-center justify-center bg-muted/30 text-caption font-medium text-muted-foreground/70"
            >
              {quarter.label}
            </span>

            <div className="grid flex-1 grid-cols-3 gap-1 p-1">
              {quarter.months.map((index) => {
                const periodValue = toPeriodValue(year, index)
                const isTaken = taken.has(periodValue)
                const isPast =
                  !allowPast &&
                  (year < currentYear ||
                    (year === currentYear && index < currentMonth))
                const allowed = isMonthAllowed(index, periodType)
                const disabled = !allowed || isTaken || isPast

                const selected =
                  year === selectedYear && index === selectedMonth - 1
                const isCurrent = year === currentYear && index === currentMonth

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(periodValue)}
                    aria-pressed={selected}
                    title={
                      isTaken
                        ? "Já existe orçamento neste período"
                        : isPast
                          ? "Período já encerrado"
                          : !allowed
                            ? periodType === BudgetPeriodType.ANNUAL
                              ? "O orçamento anual começa em janeiro"
                              : "O trimestral começa em janeiro, abril, julho ou outubro"
                            : undefined
                    }
                    className={cn(
                      "group/month relative flex flex-col items-center justify-center gap-0.5 rounded-md px-1 py-2 transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      disabled
                        ? "cursor-not-allowed text-muted-foreground/35"
                        : selected
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted",
                    )}
                  >
                    <span className="text-label font-normal capitalize">
                      {MONTH_NAMES[index]}
                    </span>

                    {selected ? (
                      <Check size={10} weight="bold" aria-hidden />
                    ) : isTaken ? (
                      <span className="text-caption text-muted-foreground/60">
                        definido
                      </span>
                    ) : isCurrent ? (
                      <span className="text-caption text-primary">hoje</span>
                    ) : (
                      <span className="text-caption opacity-0">·</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
