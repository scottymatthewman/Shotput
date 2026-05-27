import type { Plan, Workspace } from '@/types/domain'

export const DEFAULT_BUDGET_CURRENCY = 'USD'

export function planBudgetCurrency(plan: Pick<Plan, 'budgetCurrency'>): string {
  return plan.budgetCurrency ?? DEFAULT_BUDGET_CURRENCY
}

export function formatBudgetCents(
  cents: number,
  currency: string = DEFAULT_BUDGET_CURRENCY,
): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

/** Compact currency for dense cards (e.g. plan index). */
export function formatBudgetCentsCompact(
  cents: number,
  currency: string = DEFAULT_BUDGET_CURRENCY,
): string {
  if (Math.abs(cents) >= 100_000_00) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(cents / 100)
  }
  return formatBudgetCents(cents, currency)
}

/** Parse a user-entered dollar amount into cents; empty clears. */
export function parseBudgetInput(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  const normalized = trimmed.replace(/[$,\s]/g, '')
  if (!normalized) return undefined
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return undefined
  return Math.round(n * 100)
}

export function budgetInputDisplay(cents: number | undefined): string {
  if (cents === undefined) return ''
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2)
}

export type PlanBudgetRollup = {
  currency: string
  ceilingCents: number | null
  allocatedCents: number
  actualCents: number
  remainingCents: number | null
  overAllocated: boolean
  overSpent: boolean
}

export function computePlanBudgetRollup(plan: Plan, workspace: Workspace): PlanBudgetRollup {
  const currency = planBudgetCurrency(plan)
  let allocatedCents = 0
  let actualCents = 0

  for (const phaseId of plan.phaseIds) {
    const phase = workspace.phases[phaseId]
    if (!phase) continue
    allocatedCents += phase.budgetAllocatedCents ?? 0
    actualCents += phase.budgetActualCents ?? 0
  }

  const ceilingCents = plan.budgetCents ?? null

  return {
    currency,
    ceilingCents,
    allocatedCents,
    actualCents,
    remainingCents: ceilingCents != null ? ceilingCents - actualCents : null,
    overAllocated: ceilingCents != null && allocatedCents > ceilingCents,
    overSpent: ceilingCents != null && actualCents > ceilingCents,
  }
}

export function planBudgetStatusLabel(rollup: PlanBudgetRollup): string | null {
  if (rollup.ceilingCents == null) return null
  const { currency, actualCents, ceilingCents } = rollup
  const spent = formatBudgetCentsCompact(actualCents, currency)
  const ceiling = formatBudgetCentsCompact(ceilingCents, currency)
  if (rollup.overSpent) {
    const over = formatBudgetCentsCompact(actualCents - ceilingCents, currency)
    return `${spent} / ${ceiling} · ${over} over`
  }
  return `${spent} / ${ceiling}`
}
