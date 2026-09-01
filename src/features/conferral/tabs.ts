export const CONFERRAL_TABS = {
  results: "/conferencia",
  invoices: "/conferencia/notas",
} as const

export type ConferralTab = keyof typeof CONFERRAL_TABS
