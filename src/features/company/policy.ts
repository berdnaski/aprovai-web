export const HOUR_PRESETS = [8, 24, 48, 72, 120] as const

export const OVERRUN_PRESETS = [0, 5, 10] as const

export function hoursLabel(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) {
    return ""
  }

  const days = Math.floor(hours / 24)
  const rest = hours % 24

  if (days === 0) {
    return `${hours} ${hours === 1 ? "hora útil" : "horas úteis"}`
  }

  const dayLabel = `${days} ${days === 1 ? "dia útil" : "dias úteis"}`

  return rest === 0 ? dayLabel : `${dayLabel} e ${rest}h`
}

export function parseInteger(value: string): number | null {
  const digits = value.replace(/\D/g, "")

  return digits === "" ? null : Number(digits)
}

export function parsePercent(value: string): number | null {
  const normalized = value.replace(/[^\d,.]/g, "").replace(",", ".")

  if (normalized === "") {
    return null
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null
}

export function formatPercent(value: number): string {
  return String(value).replace(".", ",")
}

export function applyTolerance(capCents: string, percent: number): string {
  const cap = BigInt(capCents)
  const basisPoints = BigInt(Math.round(percent * 100))

  return (cap + (cap * basisPoints) / 10000n).toString()
}
