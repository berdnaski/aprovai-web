import type { CostCenterBudgetSummary } from "@/api/cost-centers"

export interface BudgetUsage {
  percent: number
  overBudget: boolean
  nearLimit: boolean
  availableCents: string
  exceededCents: string
  committedPercent: number
  underReviewPercent: number
}

const NEAR_LIMIT_PERCENT = 85

export function usageOf(budget: {
  totalAmountCents: string
  committedCents: string
  underReviewCents: string
}): BudgetUsage | null {
  const total = Number(budget.totalAmountCents)

  if (total <= 0) {
    return null
  }

  const committed = Number(budget.committedCents)
  const underReview = Number(budget.underReviewCents)
  const used = committed + underReview
  const overBudget = used > total
  const percent = Math.round((used / total) * 100)
  const committedPercent = Math.min((committed / total) * 100, 100)

  return {
    percent,
    overBudget,
    nearLimit: !overBudget && percent >= NEAR_LIMIT_PERCENT,
    availableCents: String(Math.max(total - used, 0)),
    exceededCents: String(Math.max(used - total, 0)),
    committedPercent,
    underReviewPercent: Math.min(
      (underReview / total) * 100,
      Math.max(100 - committedPercent, 0),
    ),
  }
}

export function readUsage(node: {
  budget: CostCenterBudgetSummary | null
}): BudgetUsage | null {
  return node.budget ? usageOf(node.budget) : null
}
