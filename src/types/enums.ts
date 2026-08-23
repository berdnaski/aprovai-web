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

export const InviteStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED",
} as const

export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus]

export const ApproverType = {
  DIRECT_MANAGER: "DIRECT_MANAGER",
  COST_CENTER_MANAGER: "COST_CENTER_MANAGER",
} as const

export type ApproverType = (typeof ApproverType)[keyof typeof ApproverType]

export const APPROVER_TYPE_LABELS: Record<ApproverType, string> = {
  DIRECT_MANAGER: "Líder direto",
  COST_CENTER_MANAGER: "Gestor do Centro de Custo",
}

export const BudgetPeriodType = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  ANNUAL: "ANNUAL",
} as const

export type BudgetPeriodType =
  (typeof BudgetPeriodType)[keyof typeof BudgetPeriodType]

export const BUDGET_PERIOD_TYPE_LABELS: Record<BudgetPeriodType, string> = {
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  ANNUAL: "Anual",
}

export const BUDGET_PERIOD_TYPE_HINTS: Record<BudgetPeriodType, string> = {
  MONTHLY: "qualquer mês",
  QUARTERLY: "jan, abr, jul ou out",
  ANNUAL: "começa em janeiro",
}

export const BudgetEntryType = {
  CONSUMPTION: "CONSUMPTION",
  REVERSAL: "REVERSAL",
} as const

export type BudgetEntryType =
  (typeof BudgetEntryType)[keyof typeof BudgetEntryType]

export const BUDGET_ENTRY_TYPE_LABELS: Record<BudgetEntryType, string> = {
  CONSUMPTION: "Consumos",
  REVERSAL: "Estornos",
}

export const CostCenterBudgetStatus = {
  ALL: "ALL",
  OVER_BUDGET: "OVER_BUDGET",
  NEAR_LIMIT: "NEAR_LIMIT",
  ATTENTION: "ATTENTION",
  NO_BUDGET: "NO_BUDGET",
} as const

export type CostCenterBudgetStatus =
  (typeof CostCenterBudgetStatus)[keyof typeof CostCenterBudgetStatus]
