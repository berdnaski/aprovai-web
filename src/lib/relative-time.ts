export function relativeTime(value: string): string {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000)

  if (seconds < 60) {
    return "agora"
  }

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `há ${hours} ${hours === 1 ? "hora" : "horas"}`
  }

  const days = Math.round(hours / 24)
  if (days < 7) {
    return `há ${days} ${days === 1 ? "dia" : "dias"}`
  }

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}
