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

export const RegistrationStatus = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  VOID: "VOID",
  UNKNOWN: "UNKNOWN",
} as const

export type RegistrationStatus =
  (typeof RegistrationStatus)[keyof typeof RegistrationStatus]

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  ACTIVE: "Ativa",
  CLOSED: "Baixada",
  INACTIVE: "Inapta",
  SUSPENDED: "Suspensa",
  VOID: "Nula",
  UNKNOWN: "Não consultada",
}

export const ValidationStatus = {
  VALIDATED: "VALIDATED",
  PENDING: "PENDING",
  FAILED: "FAILED",
} as const

export type ValidationStatus =
  (typeof ValidationStatus)[keyof typeof ValidationStatus]

export const VALIDATION_STATUS_LABELS: Record<ValidationStatus, string> = {
  VALIDATED: "Conferido",
  PENDING: "Não conferido",
  FAILED: "Falhou",
}

export const SupplierUsage = {
  ALLOWED: "ALLOWED",
  BLOCKS_SUBMISSION: "BLOCKS_SUBMISSION",
  BLOCKS_APPROVAL: "BLOCKS_APPROVAL",
} as const

export type SupplierUsage = (typeof SupplierUsage)[keyof typeof SupplierUsage]

export const SUPPLIER_USAGE_LABELS: Record<SupplierUsage, string> = {
  ALLOWED: "Liberado",
  BLOCKS_SUBMISSION: "Não abre pedido",
  BLOCKS_APPROVAL: "Não aprova",
}

export const CnpjLookupFailure = {
  TIMEOUT: "TIMEOUT",
  UNAVAILABLE: "UNAVAILABLE",
  NOT_FOUND: "NOT_FOUND",
  MALFORMED: "MALFORMED",
} as const

export type CnpjLookupFailure =
  (typeof CnpjLookupFailure)[keyof typeof CnpjLookupFailure]

export const RequestStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
  COMPLETED: "COMPLETED",
} as const

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus]


export const RequestView = {
  MINE: "MINE",
  PENDING_FOR_ME: "PENDING_FOR_ME",
  ALL: "ALL",
} as const

export type RequestView = (typeof RequestView)[keyof typeof RequestView]

export const Urgency = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const

export type Urgency = (typeof Urgency)[keyof typeof Urgency]

export const URGENCY_LABELS: Record<Urgency, string> = {
  LOW: "Baixa",
  MEDIUM: "Normal",
  HIGH: "Alta",
}

export const DecisionType = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  APPROVED_WITH_OVERRIDE: "APPROVED_WITH_OVERRIDE",
} as const

export type DecisionType = (typeof DecisionType)[keyof typeof DecisionType]


export const DecisionChannel = {
  PLATFORM: "PLATFORM",
  EMAIL: "EMAIL",
} as const

export type DecisionChannel =
  (typeof DecisionChannel)[keyof typeof DecisionChannel]

export const StepStatus = {
  WAITING: "WAITING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ESCALATED: "ESCALATED",
  CANCELED: "CANCELED",
} as const

export type StepStatus = (typeof StepStatus)[keyof typeof StepStatus]

export const ExtractionStatus = {
  QUEUED: "QUEUED",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
} as const

export type ExtractionStatus =
  (typeof ExtractionStatus)[keyof typeof ExtractionStatus]
