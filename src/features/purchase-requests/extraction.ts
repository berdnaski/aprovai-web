import type { Category } from "@/api/categories"
import type { ExtractedFields } from "@/api/purchase-requests"
import type { Supplier } from "@/api/suppliers"
import { onlyDigits } from "@/lib/cnpj"

export type MatchState = "matched" | "unregistered" | "absent"

export interface ResolvedField<T> {
  state: MatchState
  raw: string | null
  match: T | null
}

export interface ResolvedExtraction {
  supplier: ResolvedField<Supplier>
  category: ResolvedField<Category>
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

export function resolveExtraction(
  fields: ExtractedFields,
  suppliers: Supplier[],
  categories: Category[],
): ResolvedExtraction {
  const supplier = resolveSupplier(fields, suppliers)
  const category = resolveCategory(fields, categories)

  const found = [
    supplier.state !== "absent",
    category.state !== "absent",
    Boolean(fields.totalAmountCents),
    Boolean(fields.paymentTerms),
  ].filter(Boolean).length

  return {
    supplier,
    category,
    totalAmountCents: fields.totalAmountCents,
    paymentTerms: fields.paymentTerms,
    found,
  }
}

export function titleFrom(fields: ExtractedFields, fallback: string): string {
  const name = fields.supplierName?.trim()

  if (!name) {
    return fallback
  }

  return `Pedido para ${name}`.slice(0, 200)
}
