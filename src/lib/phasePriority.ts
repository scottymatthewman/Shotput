import type { Phase } from '@/types/domain'

/** Urgent first — matches priority dropdown digit hotkeys (1…4). */
export const PHASE_PRIORITY_ORDER: Phase['priority'][] = ['urgent', 'high', 'medium', 'low']

export const PHASE_PRIORITY_SORT_RANK: Record<Phase['priority'], number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
}

export function phasePriorityLabel(p: Phase['priority']): string {
  return p.charAt(0).toUpperCase() + p.slice(1)
}

export function phasePrioritySortRank(p: Phase['priority']): number {
  return PHASE_PRIORITY_SORT_RANK[p]
}
