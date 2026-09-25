import { Trash, Plus, WarningCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoneyDisplay } from "@/components/shared/money-display"
import { cn } from "@/lib/utils"

export interface AllocationOption {
  id: string
  label: string
}

export interface AllocationRow {
  costCenterId: string
  chartAccountId: string | null
  percent: string
}

const FULL_PERCENT = 100

function amountFor(totalCents: string, percent: string): bigint {
  const total = BigInt(totalCents || "0")
  const bps = BigInt(Math.round(Number(percent || "0") * 100))
  return (total * bps) / 10000n
}

export function sumPercent(rows: AllocationRow[]): number {
  return rows.reduce((sum, row) => sum + Number(row.percent || "0"), 0)
}

function redistribute(rows: AllocationRow[]): AllocationRow[] {
  if (rows.length === 0) {
    return rows
  }

  const share = Math.floor((FULL_PERCENT / rows.length) * 100) / 100
  const rounded = rows.map(() => share)
  const leftover = FULL_PERCENT - share * rows.length
  rounded[rounded.length - 1] += Math.round(leftover * 100) / 100

  return rows.map((row, index) => ({ ...row, percent: String(rounded[index]) }))
}

export function AllocationEditor({
  rows,
  onChange,
  costCenters,
  accounts,
  totalCents,
  primaryCostCenterId,
  disabled = false,
  lockSplit = false,
}: {
  rows: AllocationRow[]
  onChange: (rows: AllocationRow[]) => void
  costCenters: AllocationOption[]
  accounts: AllocationOption[]
  totalCents: string
  primaryCostCenterId?: string
  disabled?: boolean
  /** Trava centro de custo e percentual: só a conta contábil de cada linha pode mudar. */
  lockSplit?: boolean
}) {
  const total = sumPercent(rows)
  const closesTo100 = Math.abs(total - FULL_PERCENT) < 0.01
  const hasPrimary =
    !primaryCostCenterId ||
    rows.some((row) => row.costCenterId === primaryCostCenterId)
  const duplicated = (() => {
    const keys = new Set<string>()
    for (const row of rows) {
      const key = `${row.costCenterId}:${row.chartAccountId ?? ""}`
      if (keys.has(key)) {
        return true
      }
      keys.add(key)
    }
    return false
  })()

  function update(index: number, patch: Partial<AllocationRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function remove(index: number) {
    onChange(redistribute(rows.filter((_, i) => i !== index)))
  }

  function add() {
    onChange(
      redistribute([
        ...rows,
        {
          costCenterId: costCenters[0]?.id ?? "",
          chartAccountId: null,
          percent: "0",
        },
      ]),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rise-in flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2.5 sm:flex-row sm:items-center"
          >
            <Select
              value={row.costCenterId || null}
              onValueChange={(next) =>
                update(index, { costCenterId: (next ?? "") as string })
              }
              disabled={disabled || lockSplit}
            >
              <SelectTrigger
                className="h-9 w-full bg-card px-3 sm:w-48"
                aria-label="Centro de custo"
              >
                <SelectValue>
                  {(value: string | null) =>
                    costCenters.find((item) => item.id === value)?.label ??
                    "Centro de custo"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {costCenters.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={row.chartAccountId}
              onValueChange={(next) =>
                update(index, { chartAccountId: (next ?? null) as string | null })
              }
              disabled={disabled}
            >
              <SelectTrigger
                className="h-9 w-full bg-card px-3 sm:flex-1"
                aria-label="Conta contábil"
              >
                <SelectValue>
                  {(value: string | null) =>
                    value
                      ? (accounts.find((item) => item.id === value)?.label ??
                        "Conta contábil")
                      : "Sem conta contábil"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Sem conta contábil</SelectItem>
                {accounts.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex shrink-0 items-center gap-2 sm:w-64">
              <div className="relative w-20 shrink-0">
                <Input
                  value={row.percent}
                  onChange={(event) => {
                    const next = event.target.value.replace(/[^\d.,]/g, "")
                    update(index, { percent: next.replace(",", ".") })
                  }}
                  disabled={disabled || lockSplit}
                  inputMode="decimal"
                  aria-label="Percentual"
                  className="h-9 pr-5 text-right tabular-nums md:text-caption"
                />
                <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-caption text-muted-foreground">
                  %
                </span>
              </div>

              <span className="w-24 shrink-0 truncate text-right text-caption tabular-nums text-muted-foreground">
                <MoneyDisplay cents={amountFor(totalCents, row.percent).toString()} />
              </span>

              {lockSplit ? null : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled || rows.length <= 1}
                  onClick={() => remove(index)}
                  aria-label="Remover linha"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash size={14} aria-hidden />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {lockSplit ? (
        <p className="text-caption leading-relaxed text-muted-foreground">
          Centro de custo e percentual travados: o pedido já está em
          aprovação. Só a conta contábil de cada linha pode mudar.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {lockSplit ? (
          <span />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={add}
            className="gap-1.5 font-medium text-muted-foreground hover:text-foreground"
          >
            <Plus size={13} weight="bold" aria-hidden />
            Adicionar linha
          </Button>
        )}

        <span
          className={cn(
            "flex items-center gap-1.5 text-caption tabular-nums",
            closesTo100 ? "text-muted-foreground" : "text-destructive",
          )}
        >
          {!closesTo100 ? (
            <WarningCircle size={13} aria-hidden />
          ) : null}
          {total.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% de 100%
        </span>
      </div>

      {!hasPrimary ? (
        <p className="text-caption text-destructive">
          O centro de custo do pedido precisa aparecer no rateio.
        </p>
      ) : null}

      {duplicated ? (
        <p className="text-caption text-destructive">
          Há uma combinação de centro de custo e conta repetida.
        </p>
      ) : null}
    </div>
  )
}

export function allocationIsValid(
  rows: AllocationRow[],
  primaryCostCenterId?: string,
): boolean {
  if (rows.length === 0) {
    return false
  }

  if (Math.abs(sumPercent(rows) - FULL_PERCENT) >= 0.01) {
    return false
  }

  if (rows.some((row) => !row.costCenterId || Number(row.percent) <= 0)) {
    return false
  }

  const keys = new Set(
    rows.map((row) => `${row.costCenterId}:${row.chartAccountId ?? ""}`),
  )

  if (keys.size !== rows.length) {
    return false
  }

  if (
    primaryCostCenterId &&
    !rows.some((row) => row.costCenterId === primaryCostCenterId)
  ) {
    return false
  }

  return true
}

export function toAllocationPayload(rows: AllocationRow[]) {
  return rows.map((row) => ({
    costCenterId: row.costCenterId,
    chartAccountId: row.chartAccountId,
    shareBps: Math.round(Number(row.percent) * 100),
  }))
}
