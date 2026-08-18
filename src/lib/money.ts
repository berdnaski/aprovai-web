const CURRENCY = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCents(cents: string | number | bigint): string {
  const raw = typeof cents === "string" ? cents.trim() : String(cents)

  if (!/^-?\d+$/.test(raw)) {
    return CURRENCY.format(0)
  }

  const negative = raw.startsWith("-")
  const digits = negative ? raw.slice(1) : raw
  const padded = digits.padStart(3, "0")
  const units = padded.slice(0, -2)
  const decimals = padded.slice(-2)
  const value = `${negative ? "-" : ""}${units}.${decimals}`

  return CURRENCY.format(Number(value))
}

export function toCents(value: string): string {
  const normalized = value.replace(/[^\d,-]/g, "").replace(",", ".")
  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) {
    return "0"
  }

  return String(Math.round(parsed * 100))
}
