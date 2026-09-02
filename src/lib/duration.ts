export function formatHours(hours: number): string {
  if (hours <= 0) {
    return "menos de 1h"
  }

  if (hours < 1) {
    return `${Math.round(hours * 60)}min`
  }

  if (hours < 24) {
    const rounded = hours < 10 ? Math.round(hours * 10) / 10 : Math.round(hours)
    return `${String(rounded).replace(".", ",")}h`
  }

  const days = Math.round(hours / 24)

  return `${days} ${days === 1 ? "dia" : "dias"}`
}
