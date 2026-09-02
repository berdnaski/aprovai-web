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

export const NotificationEvent = {
  INVITE_RECEIVED: "INVITE_RECEIVED",
  REQUEST_PENDING: "REQUEST_PENDING",
  DECISION_MADE: "DECISION_MADE",
  REQUEST_RETURNED: "REQUEST_RETURNED",
  SLA_REMINDER: "SLA_REMINDER",
  ESCALATED: "ESCALATED",
  BUDGET_ALERT: "BUDGET_ALERT",
  MONTHLY_REPORT: "MONTHLY_REPORT",
  PO_ISSUED: "PO_ISSUED",
  DELIVERY_OVERDUE: "DELIVERY_OVERDUE",
  INVOICE_RECEIVED: "INVOICE_RECEIVED",
  MATCH_DIVERGENT: "MATCH_DIVERGENT",
  PAYABLE_DUE: "PAYABLE_DUE",
} as const

export type NotificationEvent =
  (typeof NotificationEvent)[keyof typeof NotificationEvent]

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  INVITE_RECEIVED: "Convite recebido",
  REQUEST_PENDING: "Pedido aguardando sua aprovação",
  DECISION_MADE: "Decisão tomada no seu pedido",
  REQUEST_RETURNED: "Pedido devolvido para ajuste",
  SLA_REMINDER: "Lembrete de prazo",
  ESCALATED: "Etapa escalada",
  BUDGET_ALERT: "Alerta de orçamento",
  MONTHLY_REPORT: "Relatório mensal",
  PO_ISSUED: "Ordem de compra emitida",
  DELIVERY_OVERDUE: "Entrega atrasada",
  INVOICE_RECEIVED: "Nota fiscal recebida",
  MATCH_DIVERGENT: "Divergência na conferência",
  PAYABLE_DUE: "Conta a pagar vencendo",
}

export const NOTIFICATION_EVENT_GROUPS: Record<NotificationEvent, string> = {
  INVITE_RECEIVED: "Equipe",
  REQUEST_PENDING: "Aprovações",
  DECISION_MADE: "Pedidos",
  REQUEST_RETURNED: "Pedidos",
  SLA_REMINDER: "Lembretes",
  ESCALATED: "Aprovações",
  BUDGET_ALERT: "Orçamento",
  MONTHLY_REPORT: "Relatórios",
  PO_ISSUED: "Ordens de compra",
  DELIVERY_OVERDUE: "Recebimentos",
  INVOICE_RECEIVED: "Conferência",
  MATCH_DIVERGENT: "Conferência",
  PAYABLE_DUE: "Contas a pagar",
}

export const PurchaseOrderStatus = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  SENT: "SENT",
  PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED",
  RECEIVED: "RECEIVED",
  CLOSED: "CLOSED",
  CANCELED: "CANCELED",
} as const

export type PurchaseOrderStatus =
  (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus]

export const ReceiptStatus = {
  PARTIAL: "PARTIAL",
  COMPLETE: "COMPLETE",
  REJECTED: "REJECTED",
} as const

export type ReceiptStatus = (typeof ReceiptStatus)[keyof typeof ReceiptStatus]

export const InvoiceStatus = {
  RECEIVED: "RECEIVED",
  MATCHED: "MATCHED",
  DIVERGENT: "DIVERGENT",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus]

export const InvoiceParseStatus = {
  PENDING: "PENDING",
  PARSED: "PARSED",
  FAILED: "FAILED",
} as const

export type InvoiceParseStatus =
  (typeof InvoiceParseStatus)[keyof typeof InvoiceParseStatus]

export const TaxKind = {
  ICMS: "ICMS",
  IPI: "IPI",
  PIS: "PIS",
  COFINS: "COFINS",
  ISS: "ISS",
  IRRF: "IRRF",
  CSLL: "CSLL",
  INSS: "INSS",
} as const

export type TaxKind = (typeof TaxKind)[keyof typeof TaxKind]

export const MatchStatus = {
  MATCHED: "MATCHED",
  DIVERGENT: "DIVERGENT",
  OVERRIDDEN: "OVERRIDDEN",
  REJECTED: "REJECTED",
} as const

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus]

export const DivergenceKind = {
  PRICE_ABOVE_ORDER: "PRICE_ABOVE_ORDER",
  QUANTITY_ABOVE_RECEIVED: "QUANTITY_ABOVE_RECEIVED",
  QUANTITY_ABOVE_ORDER: "QUANTITY_ABOVE_ORDER",
  ITEM_NOT_IN_ORDER: "ITEM_NOT_IN_ORDER",
  ITEM_NOT_INVOICED: "ITEM_NOT_INVOICED",
  SUPPLIER_MISMATCH: "SUPPLIER_MISMATCH",
  TOTAL_MISMATCH: "TOTAL_MISMATCH",
} as const

export type DivergenceKind =
  (typeof DivergenceKind)[keyof typeof DivergenceKind]

export const DIVERGENCE_KIND_LABELS: Record<DivergenceKind, string> = {
  PRICE_ABOVE_ORDER: "Cobraram mais caro que o combinado",
  QUANTITY_ABOVE_RECEIVED: "Faturaram mais do que chegou",
  QUANTITY_ABOVE_ORDER: "Faturaram mais do que foi pedido",
  ITEM_NOT_IN_ORDER: "Item que não estava na ordem",
  ITEM_NOT_INVOICED: "Item da ordem que não veio na nota",
  SUPPLIER_MISMATCH: "Fornecedor diferente do da ordem",
  TOTAL_MISMATCH: "Total da nota não bate com a ordem",
}

export const PayableStatus = {
  BLOCKED: "BLOCKED",
  RELEASED: "RELEASED",
  PAID: "PAID",
  CANCELED: "CANCELED",
} as const

export type PayableStatus = (typeof PayableStatus)[keyof typeof PayableStatus]

export const PayableReleaseReason = {
  MATCHED: "MATCHED",
  NO_INVOICE_REQUIRED: "NO_INVOICE_REQUIRED",
  BELOW_MATCH_THRESHOLD: "BELOW_MATCH_THRESHOLD",
} as const

export type PayableReleaseReason =
  (typeof PayableReleaseReason)[keyof typeof PayableReleaseReason]

export const PAYABLE_RELEASE_REASON_LABELS: Record<
  PayableReleaseReason,
  string
> = {
  MATCHED: "Conferência bateu",
  NO_INVOICE_REQUIRED: "Liberado sem nota fiscal",
  BELOW_MATCH_THRESHOLD: "Abaixo do limite de conferência",
}

export const NfeAuthorizationStatus = {
  UNVERIFIED: "UNVERIFIED",
  AUTHORIZED: "AUTHORIZED",
  NOT_AUTHORIZED: "NOT_AUTHORIZED",
} as const

export type NfeAuthorizationStatus =
  (typeof NfeAuthorizationStatus)[keyof typeof NfeAuthorizationStatus]

export const NfeEnvironment = {
  PRODUCTION: "PRODUCTION",
  HOMOLOGATION: "HOMOLOGATION",
} as const

export type NfeEnvironment =
  (typeof NfeEnvironment)[keyof typeof NfeEnvironment]

export const AuditEventType = {
  CREATED: "CREATED",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  CANCELED: "CANCELED",
  REASSIGNED: "REASSIGNED",
  ESCALATED: "ESCALATED",
  RULES_CHANGED: "RULES_CHANGED",
  BUDGET_CHANGED: "BUDGET_CHANGED",
  MEMBER_CHANGED: "MEMBER_CHANGED",
  PO_ISSUED: "PO_ISSUED",
  PO_SENT: "PO_SENT",
  PO_CANCELED: "PO_CANCELED",
  GOODS_RECEIVED: "GOODS_RECEIVED",
  INVOICE_UPLOADED: "INVOICE_UPLOADED",
  INVOICE_REJECTED: "INVOICE_REJECTED",
  MATCH_COMPLETED: "MATCH_COMPLETED",
  MATCH_OVERRIDDEN: "MATCH_OVERRIDDEN",
  PAYABLE_RELEASED: "PAYABLE_RELEASED",
  PAYABLE_PAID: "PAYABLE_PAID",
} as const

export type AuditEventType =
  (typeof AuditEventType)[keyof typeof AuditEventType]

export const AUDIT_EVENT_LABELS: Record<AuditEventType, string> = {
  CREATED: "Criou",
  SUBMITTED: "Enviou para aprovação",
  APPROVED: "Aprovou",
  REJECTED: "Recusou",
  CHANGES_REQUESTED: "Pediu ajustes",
  CANCELED: "Cancelou",
  REASSIGNED: "Transferiu a aprovação",
  ESCALATED: "Escalou por prazo",
  RULES_CHANGED: "Alterou a matriz de alçadas",
  BUDGET_CHANGED: "Alterou o orçamento",
  MEMBER_CHANGED: "Alterou a equipe",
  PO_ISSUED: "Emitiu a ordem",
  PO_SENT: "Enviou a ordem ao fornecedor",
  PO_CANCELED: "Cancelou a ordem",
  GOODS_RECEIVED: "Registrou o recebimento",
  INVOICE_UPLOADED: "Enviou a nota",
  INVOICE_REJECTED: "Rejeitou a nota",
  MATCH_COMPLETED: "Rodou a conferência",
  MATCH_OVERRIDDEN: "Liberou exceção na conferência",
  PAYABLE_RELEASED: "Liberou o pagamento",
  PAYABLE_PAID: "Marcou como pago",
}

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  purchase_request: "Pedido",
  purchase_order: "Ordem de compra",
  receipt: "Recebimento",
  invoice: "Nota fiscal",
  match_result: "Conferência",
  payable: "Conta a pagar",
  approval_rule: "Matriz de alçadas",
  budget: "Orçamento",
  company_member: "Membro",
  company: "Empresa",
}

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  TRIALING: "TRIALING",
  CANCELED: "CANCELED",
  EXPIRED: "EXPIRED",
} as const

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Ativa",
  TRIALING: "Em teste",
  CANCELED: "Cancelada",
  EXPIRED: "Expirada",
}

export const PLAN_TIER_LABELS: Record<string, string> = {
  BASIC: "Básico",
  PROFESSIONAL: "Profissional",
  ENTERPRISE: "Enterprise",
}

