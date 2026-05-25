import type { Phase } from '@/types/domain'

/** Urgent first — matches priority dropdown digit hotkeys (1…4). */
export const TASK_PRIORITY_ORDER: Phase['priority'][] = ['urgent', 'high', 'medium', 'low']

export const TASK_PRIORITY_SORT_RANK: Record<Phase['priority'], number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
}

export function taskPriorityLabel(p: Phase['priority']): string {
  return p.charAt(0).toUpperCase() + p.slice(1)
}

export function taskPrioritySortRank(p: Phase['priority']): number {
  return TASK_PRIORITY_SORT_RANK[p]
}
