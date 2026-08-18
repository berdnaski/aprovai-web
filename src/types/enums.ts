export const OnboardingStep = {
  ACCOUNT: "ACCOUNT",
  COMPANY: "COMPANY",
  TEAM: "TEAM",
  REVIEW: "REVIEW",
  DONE: "DONE",
} as const

export type OnboardingStep = (typeof OnboardingStep)[keyof typeof OnboardingStep]

export const ONBOARDING_ORDER: OnboardingStep[] = [
  OnboardingStep.ACCOUNT,
  OnboardingStep.COMPANY,
  OnboardingStep.TEAM,
  OnboardingStep.REVIEW,
  OnboardingStep.DONE,
]

export const CompanyMemberRole = {
  REQUESTER: "REQUESTER",
  APPROVER: "APPROVER",
  FINANCE_ADMIN: "FINANCE_ADMIN",
} as const

export type CompanyMemberRole =
  (typeof CompanyMemberRole)[keyof typeof CompanyMemberRole]

export const ROLE_LABELS: Record<CompanyMemberRole, string> = {
  REQUESTER: "Solicitante",
  APPROVER: "Aprovador",
  FINANCE_ADMIN: "Admin Financeiro",
}

export const ROLE_DESCRIPTIONS: Record<CompanyMemberRole, string> = {
  REQUESTER: "Cria pedidos de compra para o Centro de Custo a que pertence.",
  APPROVER: "Decide os pedidos que sobem até a alçada dele.",
  FINANCE_ADMIN: "Configura a empresa, aprova sem limite e cuida do financeiro.",
}
