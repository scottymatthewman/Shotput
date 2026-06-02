import { formatIsoCalendar } from '@/lib/dateDisplay'
import type { Plan } from '@/types/domain'
import { isBefore, isValid, parseISO, startOfDay } from 'date-fns'

export type PlanIndexTab = 'upcoming' | 'past' | 'archived'

export const PLAN_INDEX_TABS: { id: PlanIndexTab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'archived', label: 'Archived' },
]

function parsePlanEndDay(plan: Plan): Date | null {
  if (!plan.end?.trim()) return null
  const d = parseISO(`${plan.end.trim()}T12:00:00`)
  return isValid(d) ? startOfDay(d) : null
}

export function planMatchesIndexTab(plan: Plan, tab: PlanIndexTab, today = startOfDay(new Date())): boolean {
  if (plan.archived) return tab === 'archived'
  if (tab === 'archived') return false
  const end = parsePlanEndDay(plan)
  if (tab === 'upcoming') return !end || !isBefore(end, today)
  return !!end && isBefore(end, today)
}

export function filterPlansByIndexTab(plans: Plan[], tab: PlanIndexTab): Plan[] {
  return plans.filter((p) => planMatchesIndexTab(p, tab))
}

export function formatPlanDateRange(start?: string, end?: string): string {
  if (!start?.trim() || !end?.trim()) return '—'
  const a = formatIsoCalendar(start, 'MMM d')
  const b = formatIsoCalendar(end, 'MMM d, yyyy')
  if (a === '—' || b === '—') return '—'
  return `${a} – ${b}`
}
