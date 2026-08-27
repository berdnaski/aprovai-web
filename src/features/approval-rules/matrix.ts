import type {
  ApprovalRule,
  ApprovalRuleRange,
  ApprovalScope,
} from "@/api/approval-rules"
import { formatCents } from "@/lib/money"
import { ApproverType } from "@/types/enums"

export interface Tier {
  key: string
  ceilingCents: string | null
  approverType: ApproverType
  requiresDualApproval: boolean
}

export const MAX_TIERS = 50

let sequence = 0

function nextKey(): string {
  sequence += 1
  return `tier-${sequence}`
}

export function toTiers(rules: ApprovalRule[]): Tier[] {
  return [...rules]
    .sort((a, b) => compareCents(a.minAmountCents, b.minAmountCents))
    .map((rule) => ({
      key: nextKey(),
      ceilingCents: rule.maxAmountCents,
      approverType: rule.approverType,
      requiresDualApproval: rule.requiresDualApproval,
    }))
    .map((tier, index, all) =>
      index === all.length - 1 ? { ...tier, ceilingCents: null } : tier,
    )
}

export function toRanges(tiers: Tier[]): ApprovalRuleRange[] {
  return tiers.map((tier, index) => ({
    minAmountCents: floorOf(tiers, index),
    maxAmountCents: index === tiers.length - 1 ? null : tier.ceilingCents,
    approverType: tier.approverType,
    requiresDualApproval: tier.requiresDualApproval,
  }))
}

export function floorOf(tiers: Tier[], index: number): string {
  if (index === 0) {
    return "0"
  }

  const previous = tiers[index - 1]?.ceilingCents

  return previous ? (BigInt(previous) + 1n).toString() : "0"
}

export function ceilingOf(tiers: Tier[], index: number): string | null {
  return index === tiers.length - 1 ? null : tiers[index].ceilingCents
}

export function newTier(from?: Partial<Tier>): Tier {
  return {
    key: nextKey(),
    ceilingCents: null,
    approverType: from?.approverType ?? ApproverType.DIRECT_MANAGER,
    requiresDualApproval: from?.requiresDualApproval ?? false,
  }
}

export function seedTiers(): Tier[] {
  return [newTier()]
}

export function insertTierAfter(tiers: Tier[], index: number): Tier[] {
  const source = tiers[index]
  const inserted = newTier(source)
  const next = [...tiers]

  if (index === tiers.length - 1) {
    next[index] = { ...source, ceilingCents: "" }
    next.splice(index + 1, 0, { ...inserted, ceilingCents: null })
    return next
  }

  next.splice(index + 1, 0, { ...inserted, ceilingCents: "" })
  return next
}

export function removeTier(tiers: Tier[], index: number): Tier[] {
  if (tiers.length <= 1) {
    return tiers
  }

  const next = tiers.filter((_, position) => position !== index)

  return next.map((tier, position) =>
    position === next.length - 1 ? { ...tier, ceilingCents: null } : tier,
  )
}

export function setTierFloor(
  tiers: Tier[],
  index: number,
  floorCents: string,
): Tier[] {
  if (index === 0) {
    return tiers
  }

  const ceiling = !floorCents
    ? ""
    : BigInt(floorCents) > 0n
      ? (BigInt(floorCents) - 1n).toString()
      : "0"

  return tiers.map((tier, position) =>
    position === index - 1 ? { ...tier, ceilingCents: ceiling } : tier,
  )
}

export function updateTier(
  tiers: Tier[],
  index: number,
  patch: Partial<Omit<Tier, "key">>,
): Tier[] {
  return tiers.map((tier, position) =>
    position === index ? { ...tier, ...patch } : tier,
  )
}

export interface TierProblem {
  key: string
  message: string
}

export function validateTiers(tiers: Tier[]): TierProblem[] {
  const problems: TierProblem[] = []

  tiers.forEach((tier, index) => {
    if (index === tiers.length - 1) {
      return
    }

    const floor = floorOf(tiers, index)

    if (!tier.ceilingCents) {
      problems.push({
        key: tier.key,
        message: "Informe até quanto esta faixa vai.",
      })
      return
    }

    if (BigInt(tier.ceilingCents) <= BigInt(floor)) {
      problems.push({
        key: tier.key,
        message: `Precisa passar de ${formatCents(floor)}, que é onde esta faixa começa.`,
      })
    }
  })

  return problems
}

export function isMatrixEqual(a: Tier[], b: Tier[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  return a.every((tier, index) => {
    const other = b[index]

    return (
      (tier.ceilingCents ?? null) === (other.ceilingCents ?? null) &&
      tier.approverType === other.approverType &&
      tier.requiresDualApproval === other.requiresDualApproval
    )
  })
}

export function tierCovering(tiers: Tier[], amountCents: string): number {
  if (!/^\d+$/.test(amountCents)) {
    return -1
  }

  const amount = BigInt(amountCents)

  return tiers.findIndex((_, index) => {
    const floor = BigInt(floorOf(tiers, index))
    const ceiling = ceilingOf(tiers, index)

    return amount >= floor && (ceiling === null || amount <= BigInt(ceiling))
  })
}

export const GLOBAL_SCOPE: ApprovalScope = {
  costCenterId: null,
  categoryId: null,
}

export function scopeKey(scope: ApprovalScope): string {
  return `${scope.costCenterId ?? "*"}:${scope.categoryId ?? "*"}`
}

export function isGlobalScope(scope: ApprovalScope): boolean {
  return scope.costCenterId === null && scope.categoryId === null
}

export function isSameScope(a: ApprovalScope, b: ApprovalScope): boolean {
  return scopeKey(a) === scopeKey(b)
}

export interface ScopeMatrix {
  scope: ApprovalScope
  rules: ApprovalRule[]
}

export function specificityOf(scope: ApprovalScope): number {
  return (scope.costCenterId ? 2 : 0) + (scope.categoryId ? 1 : 0)
}

export function groupByScope(rules: ApprovalRule[]): ScopeMatrix[] {
  const groups = new Map<string, ScopeMatrix>()

  for (const rule of rules) {
    const scope: ApprovalScope = {
      costCenterId: rule.costCenterId,
      categoryId: rule.categoryId,
    }
    const key = scopeKey(scope)
    const existing = groups.get(key)

    if (existing) {
      existing.rules.push(rule)
    } else {
      groups.set(key, { scope, rules: [rule] })
    }
  }

  return [...groups.values()].sort(
    (a, b) => specificityOf(a.scope) - specificityOf(b.scope),
  )
}

export function rangeLabel(floor: string, ceiling: string | null): string {
  if (ceiling === null) {
    return floor === "0" ? "Qualquer valor" : `Acima de ${formatCents(floor)}`
  }

  if (!ceiling) {
    return floor === "0" ? "A partir de R$ 0,00" : `A partir de ${formatCents(floor)}`
  }

  if (floor === "0") {
    return `Até ${formatCents(ceiling)}`
  }

  return `${formatCents(floor)} a ${formatCents(ceiling)}`
}

export function compareCents(a: string, b: string): number {
  const left = BigInt(a || "0")
  const right = BigInt(b || "0")

  return left < right ? -1 : left > right ? 1 : 0
}

export interface ScopeNames {
  costCenters: Map<string, string>
  categories: Map<string, string>
}

export type ScopeKind = "global" | "cost-center" | "category" | "combined"

export interface ScopeDescription {
  title: string
  kind: ScopeKind
  detail: string
}

export function describeScope(
  scope: ApprovalScope,
  names: ScopeNames,
): ScopeDescription {
  const costCenter = scope.costCenterId
    ? (names.costCenters.get(scope.costCenterId) ?? "Centro de Custo removido")
    : null
  const category = scope.categoryId
    ? (names.categories.get(scope.categoryId) ?? "Categoria removida")
    : null

  if (costCenter && category) {
    return {
      title: `${costCenter} · ${category}`,
      kind: "combined",
      detail: `Pedidos de ${category} em ${costCenter}.`,
    }
  }

  if (costCenter) {
    return {
      title: costCenter,
      kind: "cost-center",
      detail: `Pedidos do Centro de Custo ${costCenter}.`,
    }
  }

  if (category) {
    return {
      title: category,
      kind: "category",
      detail: `Pedidos de ${category}, em qualquer Centro de Custo.`,
    }
  }

  return {
    title: "Padrão da empresa",
    kind: "global",
    detail: "Todo pedido que não cair numa exceção.",
  }
}
