import { CompanyMemberRole } from "@/types/enums"

export type NavAccess = "full" | "read" | "none"

export type NavArea = (typeof NAV_AREAS)[number]

const { REQUESTER, APPROVER, FINANCE_ADMIN, ACCOUNTANT } = CompanyMemberRole

function access(
  requester: NavAccess,
  approver: NavAccess,
  financeAdmin: NavAccess,
  accountant: NavAccess = "none",
): Record<CompanyMemberRole, NavAccess> {
  return {
    [REQUESTER]: requester,
    [APPROVER]: approver,
    [FINANCE_ADMIN]: financeAdmin,
    [ACCOUNTANT]: accountant,
  }
}

export const NAV_AREAS = [
  {
    key: "purchase-requests",
    label: "Pedidos",
    to: "/pedidos",
    access: access("full", "full", "full"),
  },
  {
    key: "purchase-orders",
    label: "Ordens de compra",
    to: "/ordens-de-compra",
    access: access("none", "none", "full"),
  },
  {
    key: "receipts",
    label: "Recebimentos",
    to: "/recebimentos",
    access: access("full", "none", "full"),
  },
  {
    key: "conferral",
    label: "Conferência",
    to: "/conferencia",
    access: access("none", "none", "full"),
  },
  {
    key: "payables",
    label: "Contas a pagar",
    to: "/contas-a-pagar",
    access: access("none", "none", "full", "read"),
  },
  {
    key: "service-invoices",
    label: "Notas de serviço",
    to: "/notas-de-servico",
    access: access("none", "none", "full", "read"),
  },
  {
    key: "recurring-contracts",
    label: "Assinaturas recorrentes",
    to: "/assinaturas-recorrentes",
    access: access("none", "none", "full"),
  },
  {
    key: "cost-centers",
    label: "Centros de Custo",
    to: "/centros-de-custo",
    access: access("read", "read", "full", "read"),
  },
  {
    key: "approval-rules",
    label: "Matriz de alçadas",
    to: "/matriz-de-alcadas",
    access: access("none", "read", "full"),
  },
  {
    key: "suppliers",
    label: "Fornecedores",
    to: "/fornecedores",
    access: access("read", "read", "full", "read"),
  },
  {
    key: "categories",
    label: "Categorias",
    to: "/categorias",
    access: access("read", "read", "full", "read"),
  },
  {
    key: "chart-accounts",
    label: "Plano de contas",
    to: "/plano-de-contas",
    access: access("none", "read", "full", "read"),
  },
  {
    key: "members",
    label: "Equipe",
    to: "/equipe",
    access: access("none", "read", "full"),
  },
  {
    key: "audit-logs",
    label: "Auditoria",
    to: "/auditoria",
    access: access("none", "none", "full", "read"),
  },
  {
    key: "analytics",
    label: "Dashboard",
    to: "/analytics",
    access: access("none", "none", "full"),
  },
  {
    key: "dre",
    label: "DRE gerencial",
    to: "/dre",
    access: access("none", "none", "full", "read"),
  },
  {
    key: "billing",
    label: "Plano e assinatura",
    to: "/plano",
    access: access("none", "none", "full"),
  },
  {
    key: "company",
    label: "Empresa",
    to: "/empresa/dados",
    access: access("none", "none", "full"),
  },
] as const

export type NavAreaKey = (typeof NAV_AREAS)[number]["key"]

export function accessFor(
  area: NavArea,
  role: CompanyMemberRole | null | undefined,
): NavAccess {
  return role ? area.access[role] : "none"
}

export function canSee(
  area: NavArea,
  role: CompanyMemberRole | null | undefined,
): boolean {
  return accessFor(area, role) !== "none"
}

export function canListMembers(role: CompanyMemberRole | null | undefined): boolean {
  return role === APPROVER || role === FINANCE_ADMIN
}

export function visibleAreas(role: CompanyMemberRole | null | undefined): NavArea[] {
  return NAV_AREAS.filter((area) => canSee(area, role))
}
