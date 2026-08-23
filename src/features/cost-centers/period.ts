const MONTH_YEAR = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
})

export interface PeriodRange {
  periodStart: string
  periodEnd: string
}

function parse(value: string): Date {
  return new Date(`${value.slice(0, 10)}T12:00:00`)
}

export function formatPeriodLabel(range: PeriodRange): string {
  const start = parse(range.periodStart)
  const end = parse(range.periodEnd)

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()

  if (sameMonth) {
    const label = MONTH_YEAR.format(start)
    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  const from = MONTH_YEAR.format(start)
  const to = MONTH_YEAR.format(end)

  return `${from.charAt(0).toUpperCase() + from.slice(1)} a ${to}`
}

const SHORT_MONTH = new Intl.DateTimeFormat("pt-BR", { month: "short" })

export function shortPeriodLabel(range: PeriodRange): string {
  const start = parse(range.periodStart)
  const end = parse(range.periodEnd)

  const from = SHORT_MONTH.format(start).replace(".", "")
  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()

  if (sameMonth) {
    return from
  }

  const to = SHORT_MONTH.format(end).replace(".", "")

  return `${from}–${to}`
}

export function isCurrentPeriod(
  range: PeriodRange,
  reference = new Date(),
): boolean {
  return parse(range.periodStart) <= reference && parse(range.periodEnd) >= reference
}

export function currentPeriodValue(reference = new Date()): string {
  const year = reference.getFullYear()
  const month = String(reference.getMonth() + 1).padStart(2, "0")

  return `${year}-${month}`
}

export function periodOptions(count = 12, reference = new Date()): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      reference.getFullYear(),
      reference.getMonth() - 2 + index,
      1,
    )
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")

    return `${year}-${month}`
  })
}

export function labelForPeriodValue(value: string): string {
  const [year, month] = value.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  const label = MONTH_YEAR.format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}
