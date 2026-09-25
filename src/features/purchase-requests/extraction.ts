import type { Category } from "@/api/categories"
import type { CostCenter } from "@/api/cost-centers"
import type { ExtractedFields } from "@/api/purchase-requests"
import type { Supplier } from "@/api/suppliers"
import { onlyDigits } from "@/lib/cnpj"

export type MatchState = "matched" | "unregistered" | "absent"

export interface ResolvedField<T> {
  state: MatchState
  raw: string | null
  match: T | null
}

export interface ResolvedCostCenterSplit {
  costCenter: CostCenter
  percent: number
}

export interface ResolvedExtraction {
  supplier: ResolvedField<Supplier>
  category: ResolvedField<Category>
  costCenter: ResolvedField<CostCenter>
  costCenterSplit: ResolvedCostCenterSplit[] | null
  totalAmountCents: string | null
  paymentTerms: string | null
  found: number
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

function resolveSupplier(
  fields: ExtractedFields,
  suppliers: Supplier[],
): ResolvedField<Supplier> {
  const cnpj = fields.supplierCnpj ? onlyDigits(fields.supplierCnpj) : null
  const raw = cnpj ?? fields.supplierName

  if (!raw) {
    return { state: "absent", raw: null, match: null }
  }

  const byCnpj = cnpj
    ? suppliers.find((supplier) => onlyDigits(supplier.cnpj) === cnpj)
    : undefined

  if (byCnpj) {
    return { state: "matched", raw, match: byCnpj }
  }

  const name = fields.supplierName ? normalize(fields.supplierName) : null
  const byName = name
    ? suppliers.find(
        (supplier) =>
          normalize(supplier.legalName) === name ||
          (supplier.tradeName && normalize(supplier.tradeName) === name),
      )
    : undefined

  if (byName) {
    return { state: "matched", raw, match: byName }
  }

  return { state: "unregistered", raw, match: null }
}

function resolveCategory(
  fields: ExtractedFields,
  categories: Category[],
): ResolvedField<Category> {
  if (!fields.categoryName) {
    return { state: "absent", raw: null, match: null }
  }

  const wanted = normalize(fields.categoryName)
  const match = categories.find(
    (category) =>
      normalize(category.name) === wanted ||
      normalize(category.name).includes(wanted) ||
      wanted.includes(normalize(category.name)),
  )

  return match
    ? { state: "matched", raw: fields.categoryName, match }
    : { state: "unregistered", raw: fields.categoryName, match: null }
}

function resolveCostCenter(
  fields: ExtractedFields,
  costCenters: CostCenter[],
): ResolvedField<CostCenter> {
  if (!fields.costCenterName) {
    return { state: "absent", raw: null, match: null }
  }

  const wanted = normalize(fields.costCenterName)
  const match = costCenters.find(
    (costCenter) =>
      normalize(costCenter.name) === wanted ||
      normalize(costCenter.name).includes(wanted) ||
      wanted.includes(normalize(costCenter.name)),
  )

  return match
    ? { state: "matched", raw: fields.costCenterName, match }
    : { state: "unregistered", raw: fields.costCenterName, match: null }
}

/**
 * Só vira rateio automático se TODAS as áreas citadas baterem com um Centro
 * de Custo de verdade. Uma área não reconhecida derruba o rateio inteiro —
 * melhor cair para "escolha um Centro de Custo" do que rachar dinheiro para
 * o lugar errado.
 */
function resolveCostCenterSplit(
  fields: ExtractedFields,
  costCenters: CostCenter[],
): ResolvedCostCenterSplit[] | null {
  if (!fields.costCenterSplits || fields.costCenterSplits.length < 2) {
    return null
  }

  const resolved: ResolvedCostCenterSplit[] = []

  for (const split of fields.costCenterSplits) {
    const wanted = normalize(split.costCenterName)
    const match = costCenters.find(
      (costCenter) =>
        normalize(costCenter.name) === wanted ||
        normalize(costCenter.name).includes(wanted) ||
        wanted.includes(normalize(costCenter.name)),
    )

    if (!match) {
      return null
    }

    resolved.push({ costCenter: match, percent: split.percent })
  }

  const distinct = new Set(resolved.map((item) => item.costCenter.id))

  return distinct.size === resolved.length ? resolved : null
}

export function resolveExtraction(
  fields: ExtractedFields,
  suppliers: Supplier[],
  categories: Category[],
  costCenters: CostCenter[] = [],
): ResolvedExtraction {
  const supplier = resolveSupplier(fields, suppliers)
  const category = resolveCategory(fields, categories)
  const costCenter = resolveCostCenter(fields, costCenters)
  const costCenterSplit = resolveCostCenterSplit(fields, costCenters)

  const found = [
    Boolean(fields.title),
    Boolean(fields.description),
    supplier.state !== "absent",
    category.state !== "absent",
    costCenter.state !== "absent" || costCenterSplit !== null,
    Boolean(fields.totalAmountCents),
    Boolean(fields.paymentTerms),
    fields.items.length > 0,
  ].filter(Boolean).length

  return {
    supplier,
    category,
    costCenter,
    costCenterSplit,
    totalAmountCents: fields.totalAmountCents,
    paymentTerms: fields.paymentTerms,
    found,
  }
}

export interface CostCenterSplitLine {
  costCenterId: string
  shareBps: number
}

/** Converte percentual (até 2 casas) em basis points inteiros somando exatos 10000. */
export function splitToShareBps(
  split: ResolvedCostCenterSplit[],
): CostCenterSplitLine[] {
  const lines = split.map((item) => ({
    costCenterId: item.costCenter.id,
    shareBps: Math.round(item.percent * 100),
  }))

  const total = lines.reduce((sum, line) => sum + line.shareBps, 0)
  const gap = 10000 - total

  if (gap !== 0) {
    const biggest = lines.reduce((max, line) =>
      line.shareBps > max.shareBps ? line : max,
    )
    biggest.shareBps += gap
  }

  return lines
}

export function titleFrom(fields: ExtractedFields, fallback: string): string {
  const title = fields.title?.trim()

  if (title) {
    return title.slice(0, 200)
  }

  const name = fields.supplierName?.trim()

  if (!name) {
    return fallback
  }

  return `Pedido para ${name}`.slice(0, 200)
}
